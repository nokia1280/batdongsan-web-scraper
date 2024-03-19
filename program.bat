@echo off
@echo off

rem
set "SCRIPT_DIR=%~dp0"

rem
cd /d "%SCRIPT_DIR%"

rem
echo Do you want to scrape new data? (Y/N)
set /p choice=""

rem
if /i "%choice%"=="Y" (
    rem
    node index.js
) else (
    rem
    echo ok.
)

rem
start http-server -c-1

rem
start http://localhost:8080/main.html
pause