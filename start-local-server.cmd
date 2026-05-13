@echo off
cd /d "%~dp0"

echo Starting Lasshi locally...
echo.
echo Open this URL in Chrome:
echo http://127.0.0.1:5500/index.html
echo.
echo Keep this window open while using the website.
echo Press Ctrl+C to stop the server.
echo.

python -m http.server 5500 --bind 127.0.0.1

echo.
echo Server stopped.
pause
