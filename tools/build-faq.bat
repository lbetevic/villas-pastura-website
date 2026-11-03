@echo off
setlocal
cd /d "%~dp0.."
py tools\build_faq.py
if errorlevel 1 (
  echo.
  echo FAQ build failed. Review the error above.
  pause
  exit /b 1
)
echo.
echo FAQ HTML, translations and structured data are synchronized.
pause
