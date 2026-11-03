#!/usr/bin/env python3
"""Build the Villas Pastura responsive gallery from paired master folders.

Expected input structure:

    gallery-masters/portrait/020_description.jpg
    gallery-masters/landscape/020_description.jpg

The three-digit source ID pairs the two manually composed crops. Public names,
gallery order, categories and translated captions come from gallery-manifest.json.
The script never makes a compositional crop and never upscales an image.
"""

from __future__ import annotations

import argparse
import html
import io
import json
import os
import re
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageCms, ImageOps, features
except ImportError:
    print(
        "Pillow is required. Run: py -m pip install -r "
        '"tools\\requirements-image-tools.txt"',
        file=sys.stderr,
    )
    raise SystemExit(2)


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_INPUT = PROJECT_ROOT / "gallery-masters"
DEFAULT_MANIFEST = PROJECT_ROOT / "gallery-manifest.json"
DEFAULT_HTML = PROJECT_ROOT / "gallery.html"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}
MASTER_PATTERN = re.compile(r"^(?P<source_id>\d{3})[_-].+$")
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SOURCE_ID_PATTERN = re.compile(r"^\d{3}$")
LANGUAGES = ("en", "de", "hr", "it")
SCHEMA_START = "<!-- GALLERY_SCHEMA_START -->"
SCHEMA_END = "<!-- GALLERY_SCHEMA_END -->"
DATA_START = "<!-- GALLERY_DATA_START -->"
DATA_END = "<!-- GALLERY_DATA_END -->"
ITEMS_START = "<!-- GALLERY_ITEMS_START -->"
ITEMS_END = "<!-- GALLERY_ITEMS_END -->"


@dataclass(frozen=True)
class OrientationSpec:
    ratio_width: int
    ratio_height: int
    ratio_tolerance: float


@dataclass(frozen=True)
class DerivativeSpec:
    width: int
    height: int
    quality: int
    recommended_max_kb: int


ORIENTATIONS = {
    "portrait": OrientationSpec(4, 5, 0.002),
    "landscape": OrientationSpec(3, 2, 0.002),
}


class BuildError(RuntimeError):
    """A user-correctable input, manifest or build error."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Generate WebP derivatives from paired 4:5 portrait and 3:2 "
            "landscape masters, optionally rebuilding static gallery HTML."
        )
    )
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--html", type=Path, default=DEFAULT_HTML)
    parser.add_argument("--portrait-widths", type=int, nargs="+")
    parser.add_argument("--landscape-widths", type=int, nargs="+")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Replace existing generated WebP files.",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Validate masters, manifest and requested outputs without writing.",
    )
    parser.add_argument(
        "--sync-html",
        action="store_true",
        help="Rebuild marked gallery items, translations and JSON-LD in gallery.html.",
    )
    return parser.parse_args()


def load_manifest(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise BuildError(f"Manifest does not exist: {path}") from exc
    except json.JSONDecodeError as exc:
        raise BuildError(f"Manifest JSON is invalid: {exc}") from exc

    if not isinstance(payload, dict) or not isinstance(payload.get("gallery"), dict):
        raise BuildError("Manifest needs a gallery object.")
    if not isinstance(payload.get("images"), list) or not payload["images"]:
        raise BuildError("Manifest needs a non-empty images array.")

    seen_ids: set[str] = set()
    seen_orders: set[int] = set()
    seen_slugs: set[str] = set()
    for index, image in enumerate(payload["images"]):
        label = f"images[{index}]"
        if not isinstance(image, dict):
            raise BuildError(f"{label} must be an object.")
        source_id = image.get("sourceId")
        order = image.get("order")
        slug = image.get("slug")
        categories = image.get("categories")
        captions = image.get("captions")
        layout = image.get("layout", "standard")
        if not isinstance(source_id, str) or not SOURCE_ID_PATTERN.fullmatch(source_id):
            raise BuildError(f"{label}.sourceId must contain exactly three digits.")
        if source_id in seen_ids:
            raise BuildError(f"Duplicate sourceId in manifest: {source_id}")
        if not isinstance(order, int) or order < 0 or order in seen_orders:
            raise BuildError(f"{label}.order must be a unique non-negative integer.")
        if not isinstance(slug, str) or not SLUG_PATTERN.fullmatch(slug):
            raise BuildError(f"{label}.slug is not a lowercase hyphenated slug.")
        if slug in seen_slugs:
            raise BuildError(f"Duplicate public slug in manifest: {slug}")
        if not isinstance(categories, list) or not categories:
            raise BuildError(f"{label}.categories must be a non-empty array.")
        if any(not isinstance(item, str) or not SLUG_PATTERN.fullmatch(item) for item in categories):
            raise BuildError(f"{label}.categories contains an invalid category.")
        if layout not in {"standard", "wide", "featured"}:
            raise BuildError(f"{label}.layout must be standard, wide or featured.")
        if not isinstance(captions, dict):
            raise BuildError(f"{label}.captions must be an object.")
        for language in LANGUAGES:
            if not isinstance(captions.get(language), str) or not captions[language].strip():
                raise BuildError(f"{label}.captions.{language} is required.")
        seen_ids.add(source_id)
        seen_orders.add(order)
        seen_slugs.add(slug)

    return payload


def positive_unique_widths(values: list[int], label: str) -> list[int]:
    if not values or any(value <= 0 for value in values):
        raise BuildError(f"{label} must contain positive pixel widths.")
    if len(values) != len(set(values)):
        raise BuildError(f"{label} contains duplicate widths.")
    return sorted(values)


def discover_orientation(folder: Path) -> dict[str, Path]:
    if not folder.is_dir():
        raise BuildError(f"Master folder does not exist: {folder}")
    discovered: dict[str, Path] = {}
    badly_named: list[str] = []
    for path in sorted(folder.iterdir()):
        if not path.is_file() or path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            continue
        match = MASTER_PATTERN.fullmatch(path.stem)
        if not match:
            badly_named.append(path.name)
            continue
        source_id = match.group("source_id")
        if source_id in discovered:
            raise BuildError(
                f"Duplicate source ID {source_id} in {folder.name}: "
                f"{discovered[source_id].name} and {path.name}"
            )
        discovered[source_id] = path
    if badly_named:
        names = "\n  - ".join(badly_named)
        raise BuildError(
            f"Every master name in {folder.name} must start with a three-digit ID:"
            f"\n  - {names}"
        )
    if not discovered:
        raise BuildError(f"No master images found in {folder}")
    return discovered


def discover_pairs(input_dir: Path) -> dict[str, dict[str, Path]]:
    groups = {
        orientation: discover_orientation(input_dir / orientation)
        for orientation in ORIENTATIONS
    }
    all_ids = set().union(*(set(group) for group in groups.values()))
    incomplete = [
        source_id
        for source_id in sorted(all_ids)
        if any(source_id not in groups[orientation] for orientation in ORIENTATIONS)
    ]
    if incomplete:
        raise BuildError(
            "Every source ID needs both portrait and landscape masters: "
            + ", ".join(incomplete)
        )
    return {
        source_id: {
            orientation: groups[orientation][source_id]
            for orientation in ORIENTATIONS
        }
        for source_id in sorted(all_ids)
    }


def open_transposed(path: Path) -> Image.Image:
    try:
        with Image.open(path) as source:
            transposed = ImageOps.exif_transpose(source)
            transposed.load()
            return transposed.copy()
    except Exception as exc:
        raise BuildError(f"Cannot read {path.name}: {exc}") from exc


def derivative_specs(orientation: str, widths: list[int]) -> list[DerivativeSpec]:
    ratio = ORIENTATIONS[orientation]
    specs: list[DerivativeSpec] = []
    for width in widths:
        height = round(width * ratio.ratio_height / ratio.ratio_width)
        if orientation == "portrait":
            quality, limit = (
                (80, 100) if width <= 480 else (82, 230) if width <= 960 else (85, 420)
            )
        else:
            quality, limit = (
                (80, 80)
                if width <= 480
                else (82, 190)
                if width <= 960
                else (84, 430)
                if width <= 1800
                else (86, 700)
            )
        specs.append(DerivativeSpec(width, height, quality, limit))
    return specs


def validate_master(
    path: Path, orientation: str, derivatives: list[DerivativeSpec]
) -> tuple[int, int]:
    spec = ORIENTATIONS[orientation]
    image = open_transposed(path)
    try:
        width, height = image.size
    finally:
        image.close()
    actual_ratio = width / height
    expected_ratio = spec.ratio_width / spec.ratio_height
    relative_error = abs(actual_ratio - expected_ratio) / expected_ratio
    if relative_error > spec.ratio_tolerance:
        raise BuildError(
            f"{path.name} is {width}x{height}; expected approximately "
            f"{spec.ratio_width}:{spec.ratio_height}. Crop it manually first."
        )
    too_large = [item for item in derivatives if item.width > width or item.height > height]
    if too_large:
        largest = too_large[-1]
        raise BuildError(
            f"{path.name} is {width}x{height}, too small for "
            f"{largest.width}x{largest.height}. The script never upscales."
        )
    return width, height


def srgb_profile_bytes() -> bytes:
    return ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


SRGB_PROFILE = srgb_profile_bytes()


def convert_to_srgb(image: Image.Image, source_name: str) -> Image.Image:
    embedded_profile = image.info.get("icc_profile")
    if embedded_profile:
        try:
            source_profile = ImageCms.ImageCmsProfile(io.BytesIO(embedded_profile))
            return ImageCms.profileToProfile(
                image,
                source_profile,
                ImageCms.createProfile("sRGB"),
                outputMode="RGB",
            )
        except Exception as exc:
            raise BuildError(
                f"Cannot convert the color profile in {source_name} to sRGB: {exc}"
            ) from exc
    if image.mode in {"RGBA", "LA"}:
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        rgba.close()
        return background
    return image.convert("RGB")


def output_path(
    output_dir: Path,
    prefix: str,
    slug: str,
    orientation: str,
    derivative: DerivativeSpec,
) -> Path:
    return output_dir / (
        f"{prefix}-{slug}-{orientation}-{derivative.width}x{derivative.height}.webp"
    )


def save_webp_atomic(image: Image.Image, destination: Path, quality: int) -> None:
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{destination.stem}-",
        suffix=".tmp.webp",
        dir=destination.parent,
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        image.save(
            temporary,
            format="WEBP",
            quality=quality,
            method=6,
            lossless=False,
            exact=True,
            icc_profile=SRGB_PROFILE,
        )
        os.replace(temporary, destination)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def build_scene(
    image_record: dict[str, Any],
    masters: dict[str, Path],
    output_dir: Path,
    prefix: str,
    derivatives: dict[str, list[DerivativeSpec]],
) -> list[tuple[Path, DerivativeSpec]]:
    generated: list[tuple[Path, DerivativeSpec]] = []
    for orientation in ORIENTATIONS:
        master = open_transposed(masters[orientation])
        srgb = convert_to_srgb(master, masters[orientation].name)
        master.close()
        try:
            for derivative in derivatives[orientation]:
                resized = srgb.resize(
                    (derivative.width, derivative.height),
                    resample=Image.Resampling.LANCZOS,
                    reducing_gap=3.0,
                )
                destination = output_path(
                    output_dir,
                    prefix,
                    image_record["slug"],
                    orientation,
                    derivative,
                )
                try:
                    save_webp_atomic(resized, destination, derivative.quality)
                finally:
                    resized.close()
                generated.append((destination, derivative))
        finally:
            srgb.close()
    return generated


def public_url(path: Path) -> str:
    try:
        return path.resolve().relative_to(PROJECT_ROOT.resolve()).as_posix()
    except ValueError as exc:
        raise BuildError("--sync-html requires --output inside the project folder.") from exc


def srcset(
    output_dir: Path,
    prefix: str,
    record: dict[str, Any],
    orientation: str,
    derivatives: list[DerivativeSpec],
) -> str:
    return ", ".join(
        f"{public_url(output_path(output_dir, prefix, record['slug'], orientation, item))} {item.width}w"
        for item in derivatives
    )


def item_markup(
    index: int,
    record: dict[str, Any],
    output_dir: Path,
    prefix: str,
    derivatives: dict[str, list[DerivativeSpec]],
) -> str:
    portrait = derivatives["portrait"]
    landscape = derivatives["landscape"]
    portrait_full = portrait[-2:] if len(portrait) > 1 else portrait
    landscape_full = landscape[-2:] if len(landscape) > 1 else landscape
    landscape_grid = landscape[:-1] if len(landscape) > 1 else landscape
    fallback = min(landscape, key=lambda item: abs(item.width - 960))
    layout = record.get("layout", "standard")
    class_suffix = "" if layout == "standard" else f" gallery-item-{layout}"
    categories = " ".join(record["categories"])
    caption = record["captions"]["en"]
    escaped_caption = html.escape(caption, quote=True)
    sizes = (
        "(min-width: 1200px) 780px, (min-width: 980px) calc(66vw - 24px), calc(100vw - 32px)"
        if layout in {"featured", "wide"}
        else "(min-width: 1200px) 380px, (min-width: 980px) calc(33vw - 24px), calc(50vw - 24px)"
    )
    loading = 'loading="eager" fetchpriority="high"' if index == 0 else 'loading="lazy"'
    full_src = public_url(
        output_path(output_dir, prefix, record["slug"], "landscape", landscape_full[0])
    )
    mobile_src = public_url(
        output_path(output_dir, prefix, record["slug"], "portrait", portrait_full[0])
    )
    return f'''          <figure class="gallery-item{class_suffix}" data-category="{categories}">
            <button class="gallery-open" type="button" data-gallery-index="{index}" data-image-id="{record['sourceId']}" data-full-src="{full_src}" data-full-srcset="{srcset(output_dir, prefix, record, 'landscape', landscape_full)}" data-mobile-full-src="{mobile_src}" data-mobile-full-srcset="{srcset(output_dir, prefix, record, 'portrait', portrait_full)}" data-alt="{escaped_caption}">
              <picture>
                <source media="(max-width: 699px)" srcset="{srcset(output_dir, prefix, record, 'portrait', portrait)}" sizes="calc(100vw - 32px)" type="image/webp" />
                <source media="(min-width: 700px)" srcset="{srcset(output_dir, prefix, record, 'landscape', landscape_grid)}" sizes="{sizes}" type="image/webp" />
                <img src="{public_url(output_path(output_dir, prefix, record['slug'], 'landscape', fallback))}" width="{fallback.width}" height="{fallback.height}" alt="{escaped_caption}" {loading} decoding="async" />
              </picture>
              <span class="photo-expand" aria-hidden="true">↗</span>
            </button>
            <figcaption data-image-caption>{html.escape(caption)}</figcaption>
          </figure>'''


def replace_marked(source: str, start: str, end: str, replacement: str) -> str:
    if source.count(start) != 1 or source.count(end) != 1:
        raise BuildError(f"gallery.html needs exactly one {start} and {end} marker.")
    before, remainder = source.split(start, 1)
    _, after = remainder.split(end, 1)
    return f"{before}{start}\n{replacement.rstrip()}\n{end}{after}"


def sync_html(
    html_path: Path,
    manifest: dict[str, Any],
    output_dir: Path,
    derivatives: dict[str, list[DerivativeSpec]],
) -> None:
    try:
        source = html_path.read_text(encoding="utf-8")
    except FileNotFoundError as exc:
        raise BuildError(f"Gallery HTML does not exist: {html_path}") from exc
    records = sorted(manifest["images"], key=lambda item: item["order"])
    gallery = manifest["gallery"]
    prefix = gallery["imagePrefix"]
    largest_landscape = derivatives["landscape"][-1]
    schema = {
        "@context": "https://schema.org",
        "@type": "ImageGallery",
        "name": gallery["name"],
        "description": gallery["description"],
        "about": {
            "@type": "VacationRental",
            "name": "Private Pool Villas Pastura",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Novalja",
                "addressRegion": "Pag Island",
                "addressCountry": "HR",
            },
            "numberOfBedrooms": 4,
            "occupancy": {"@type": "QuantitativeValue", "maxValue": 12},
        },
        "associatedMedia": [
            {
                "@type": "ImageObject",
                "contentUrl": public_url(
                    output_path(
                        output_dir,
                        prefix,
                        record["slug"],
                        "landscape",
                        largest_landscape,
                    )
                ),
                "caption": record["captions"]["en"],
            }
            for record in records
        ],
    }
    runtime_data = {
        "images": [
            {"sourceId": record["sourceId"], "captions": record["captions"]}
            for record in records
        ]
    }
    schema_markup = (
        '  <script type="application/ld+json">\n'
        + json.dumps(schema, ensure_ascii=False, indent=2)
        + "\n  </script>"
    )
    data_json = json.dumps(runtime_data, ensure_ascii=False, separators=(",", ":"))
    data_markup = (
        '  <script type="application/json" id="gallery-image-data">'
        + data_json.replace("</", "<\\/")
        + "</script>"
    )
    items_markup = "\n\n".join(
        item_markup(index, record, output_dir, prefix, derivatives)
        for index, record in enumerate(records)
    )
    source = replace_marked(source, SCHEMA_START, SCHEMA_END, schema_markup)
    source = replace_marked(source, DATA_START, DATA_END, data_markup)
    source = replace_marked(source, ITEMS_START, ITEMS_END, items_markup)

    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{html_path.name}-", suffix=".tmp", dir=html_path.parent
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        temporary.write_text(source, encoding="utf-8", newline="\n")
        os.replace(temporary, html_path)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def main() -> int:
    args = parse_args()
    input_dir = args.input.resolve()
    manifest = load_manifest(args.manifest.resolve())
    gallery = manifest["gallery"]
    prefix = gallery.get("imagePrefix", "villas-pastura")
    if not isinstance(prefix, str) or not SLUG_PATTERN.fullmatch(prefix):
        raise BuildError("gallery.imagePrefix must be a lowercase hyphenated slug.")

    portrait_widths = positive_unique_widths(
        args.portrait_widths or gallery.get("portraitWidths", []), "portrait widths"
    )
    landscape_widths = positive_unique_widths(
        args.landscape_widths or gallery.get("landscapeWidths", []), "landscape widths"
    )
    derivatives = {
        "portrait": derivative_specs("portrait", portrait_widths),
        "landscape": derivative_specs("landscape", landscape_widths),
    }
    output_dir = (
        args.output.resolve()
        if args.output
        else (PROJECT_ROOT / gallery.get("outputDirectory", "assets/img/gallery")).resolve()
    )
    pairs = discover_pairs(input_dir)
    manifest_ids = {record["sourceId"] for record in manifest["images"]}
    pair_ids = set(pairs)
    if manifest_ids != pair_ids:
        missing_manifest = sorted(pair_ids - manifest_ids)
        missing_masters = sorted(manifest_ids - pair_ids)
        details = []
        if missing_manifest:
            details.append("not in manifest: " + ", ".join(missing_manifest))
        if missing_masters:
            details.append("missing master pairs: " + ", ".join(missing_masters))
        raise BuildError("Manifest/master mismatch; " + "; ".join(details))

    records_by_id = {record["sourceId"]: record for record in manifest["images"]}
    print(f"Found {len(pairs)} complete portrait/landscape scene pair(s).")
    for source_id in sorted(pairs):
        for orientation in ORIENTATIONS:
            width, height = validate_master(
                pairs[source_id][orientation], orientation, derivatives[orientation]
            )
            print(
                f"  OK  {source_id} {orientation:<9} "
                f"{pairs[source_id][orientation].name}: {width}x{height}"
            )

    planned = [
        output_path(output_dir, prefix, record["slug"], orientation, derivative)
        for record in manifest["images"]
        for orientation in ORIENTATIONS
        for derivative in derivatives[orientation]
    ]
    collisions = [path for path in planned if path.exists()]
    if collisions and not args.overwrite and not args.check_only:
        names = "\n  - ".join(path.name for path in collisions)
        raise BuildError(
            "Output files already exist. Use --overwrite to replace them:\n  - " + names
        )

    if args.check_only:
        if args.sync_html:
            public_url(output_dir / "probe.webp")
        print("Validation complete. No files were written.")
        return 0

    output_dir.mkdir(parents=True, exist_ok=True)
    generated: list[tuple[Path, DerivativeSpec]] = []
    for source_id in sorted(pairs):
        generated.extend(
            build_scene(
                records_by_id[source_id],
                pairs[source_id],
                output_dir,
                prefix,
                derivatives,
            )
        )

    if args.sync_html:
        sync_html(args.html.resolve(), manifest, output_dir, derivatives)

    print(f"\nGenerated {len(generated)} WebP file(s) in {output_dir}")
    warnings = 0
    for destination, derivative in generated:
        size_kb = destination.stat().st_size / 1024
        warning = "  [check weight]" if size_kb > derivative.recommended_max_kb else ""
        warnings += bool(warning)
        print(
            f"  {destination.name:<100} {size_kb:7.1f} KB  "
            f"q={derivative.quality}{warning}"
        )
    if args.sync_html:
        print(f"Updated static gallery markup and SEO data in {args.html.resolve()}")
    print(f"Completed with {warnings} image weight warning(s).")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except BuildError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
