@echo off
cd /d "%~dp0"

set /p msg="Güncelleme notunu yaz: "

git add .
git commit -m "%msg%"
git push

pause
