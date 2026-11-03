#!/usr/bin/env python3
"""Resize one folder of already-cropped images to explicit WebP resolutions."""

from __future__ import annotations

import argparse
import io
import os
import re
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageCms, ImageOps, features
except ImportError:
    print(
        "Pillow is required. Run: py -m pip install -r "
        '"tools\\requirements-image-tools.txt"',
        file=sys.stderr,
    )
    raise SystemExit(2)


SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}
SIZE_PATTERN = re.compile(r"^(?P<width>\d+)[xX](?P<height>\d+)$")


class ResizeError(RuntimeError):
    pass


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Create WebP copies at one or more exact resolutions. The input "
            "images must already have the requested aspect ratio."
        )
    )
    parser.add_argument("input", type=Path, help="Folder containing source images")
    parser.add_argument(
        "--sizes",
        nargs="+",
        required=True,
        metavar="WIDTHxHEIGHT",
        help="One or more outputs, for example 480x600 960x1200",
    )
    parser.add_argument(
        "--output",
        type=Path,
        help="Output folder; defaults to a generated subfolder inside the input folder",
    )
    parser.add_argument("--quality", type=int, default=84, choices=range(60, 96))
    parser.add_argument("--overwrite", action="store_true")
    return parser.parse_args()


def parse_sizes(values: list[str]) -> list[tuple[int, int]]:
    sizes: list[tuple[int, int]] = []
    for value in values:
        match = SIZE_PATTERN.fullmatch(value)
        if not match:
            raise ResizeError(f"Invalid size '{value}'; use WIDTHxHEIGHT.")
        size = (int(match.group("width")), int(match.group("height")))
        if min(size) <= 0 or size in sizes:
            raise ResizeError(f"Invalid or duplicate size: {value}")
        sizes.append(size)
    first_ratio = sizes[0][0] / sizes[0][1]
    if any(abs(width / height - first_ratio) > 0.0001 for width, height in sizes[1:]):
        raise ResizeError("All requested output sizes must have the same aspect ratio.")
    return sorted(sizes)


def slugify(value: str) -> str:
    value = re.sub(r"(?i)^\d{3}[_-]+", "", value)
    value = re.sub(r"(?i)^villas?[_-]+pastura[_-]+", "", value)
    value = value.lower().replace("vith", "with")
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    if not value:
        raise ResizeError("A source filename could not be converted to a usable slug.")
    return value


def srgb_profile_bytes() -> bytes:
    return ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB")).tobytes()


SRGB_PROFILE = srgb_profile_bytes()


def convert_to_srgb(image: Image.Image, source_name: str) -> Image.Image:
    profile = image.info.get("icc_profile")
    if profile:
        try:
            return ImageCms.profileToProfile(
                image,
                ImageCms.ImageCmsProfile(io.BytesIO(profile)),
                ImageCms.createProfile("sRGB"),
                outputMode="RGB",
            )
        except Exception as exc:
            raise ResizeError(f"Cannot convert {source_name} to sRGB: {exc}") from exc
    if image.mode in {"RGBA", "LA"}:
        rgba = image.convert("RGBA")
        background = Image.new("RGB", rgba.size, "white")
        background.paste(rgba, mask=rgba.getchannel("A"))
        rgba.close()
        return background
    return image.convert("RGB")


def save_atomic(image: Image.Image, destination: Path, quality: int) -> None:
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{destination.stem}-", suffix=".tmp.webp", dir=destination.parent
    )
    os.close(descriptor)
    temporary = Path(temporary_name)
    try:
        image.save(
            temporary,
            format="WEBP",
            quality=quality,
            method=6,
            exact=True,
            icc_profile=SRGB_PROFILE,
        )
        os.replace(temporary, destination)
    except Exception:
        temporary.unlink(missing_ok=True)
        raise


def main() -> int:
    args = parse_args()
    if not features.check("webp"):
        raise ResizeError("This Pillow installation does not include WebP support.")
    input_dir = args.input.resolve()
    if not input_dir.is_dir():
        raise ResizeError(f"Input folder does not exist: {input_dir}")
    output_dir = (args.output.resolve() if args.output else input_dir / "generated")
    sizes = parse_sizes(args.sizes)
    target_ratio = sizes[0][0] / sizes[0][1]
    sources = sorted(
        path
        for path in input_dir.iterdir()
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    )
    if not sources:
        raise ResizeError(f"No supported images found in {input_dir}")

    jobs: list[tuple[Path, Path, tuple[int, int]]] = []
    seen_outputs: set[Path] = set()
    for source in sources:
        try:
            with Image.open(source) as opened:
                image = ImageOps.exif_transpose(opened)
                width, height = image.size
        except Exception as exc:
            raise ResizeError(f"Cannot read {source.name}: {exc}") from exc
        relative_error = abs(width / height - target_ratio) / target_ratio
        if relative_error > 0.002:
            raise ResizeError(
                f"{source.name} is {width}x{height}; it does not match the requested ratio."
            )
        for target_width, target_height in sizes:
            if target_width > width or target_height > height:
                raise ResizeError(
                    f"{source.name} is too small for {target_width}x{target_height}; "
                    "the script never upscales."
                )
            destination = output_dir / (
                f"{slugify(source.stem)}-{target_width}x{target_height}.webp"
            )
            if destination in seen_outputs:
                raise ResizeError(f"Two source names produce the same output: {destination.name}")
            seen_outputs.add(destination)
            jobs.append((source, destination, (target_width, target_height)))

    collisions = [destination for _, destination, _ in jobs if destination.exists()]
    if collisions and not args.overwrite:
        raise ResizeError(
            "Output files already exist. Use --overwrite to replace them: "
            + ", ".join(path.name for path in collisions)
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    for source in sources:
        with Image.open(source) as opened:
            transposed = ImageOps.exif_transpose(opened)
            transposed.load()
            converted = convert_to_srgb(transposed.copy(), source.name)
        try:
            for target_source, destination, size in jobs:
                if target_source != source:
                    continue
                resized = converted.resize(
                    size, resample=Image.Resampling.LANCZOS, reducing_gap=3.0
                )
                try:
                    save_atomic(resized, destination, args.quality)
                finally:
                    resized.close()
                print(f"{source.name} -> {destination.name}")
        finally:
            converted.close()

    print(f"Generated {len(jobs)} WebP file(s) in {output_dir}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ResizeError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
