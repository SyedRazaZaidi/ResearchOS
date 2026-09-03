@echo off
cd /d "%~dp0..\frontend"
call npm run dev -- --port 3000
