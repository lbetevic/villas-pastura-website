@echo off
setlocal
py "%~dp0build_gallery_images.py" --overwrite --sync-html %*
if errorlevel 1 (
  echo.
  echo Gallery build failed. Read the ERROR message above; no invalid master is auto-cropped.
  pause
  exit /b 1
)
echo.
echo Gallery images and static HTML generated successfully.
pause
