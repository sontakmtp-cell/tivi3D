@echo off
echo =======================================
echo     KHOI DONG UNG DUNG TU VI
echo =======================================
echo.

echo [1/2] Dang khoi dong Backend API (FastAPI)...
start "TuVi Backend API" cmd /k "title TuVi Backend API && cd /d "%~dp0backend" && call .venv\Scripts\activate && python main.py"

echo [2/2] Dang khoi dong Frontend (Vite + React)...
start "TuVi Frontend" cmd /k "title TuVi Frontend && cd /d "%~dp0tuvi-app" && npm run dev"

echo.
echo =======================================
echo Da khoi dong xong! Vui long doi giay lat de 2 ung dung bat len:
echo + Backend API: http://localhost:8000
echo + Frontend UI: http://localhost:5173
echo =======================================
pause
