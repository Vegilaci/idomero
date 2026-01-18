@echo off
title Idomero - Backend + Frontend

echo ===============================
echo Idomero inditasa
echo ===============================

REM ===== BACKEND =====
start "Backend (FastAPI)" cmd /k ^
cd /d "%~dp0backend" ^& ^
call env\Scripts\activate ^& ^
uvicorn app.main:app --reload --host 0.0.0.0


REM ===== FRONTEND =====
start "Frontend (Vite React)" cmd /k ^
cd /d "%~dp0idomero-ui" ^& ^
npm run dev

echo ===============================
echo Minden elinditva.
echo ===============================
