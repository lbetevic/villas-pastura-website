@echo off
setlocal
py -m pip install -r "%~dp0requirements-image-tools.txt"
if errorlevel 1 (
  echo.
  echo Installation failed. Confirm that Python 3 is installed and available as "py".
  pause
  exit /b 1
)
echo.
echo Pillow and WebP support are ready.
pause
