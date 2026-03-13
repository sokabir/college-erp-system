@echo off
title College ERP System - Starting...
color 0A

echo ========================================
echo    College ERP System - Startup
echo ========================================
echo.

REM Check if MySQL is running
echo [1/4] Checking MySQL...
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MySQL is already running!
) else (
    echo Starting MySQL...
    start /B "" "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --console
    timeout /t 5 /nobreak >nul
)

echo.
echo [2/4] Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting Frontend Server...
cd ..\frontend
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Opening Browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo    College ERP System is Running!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Demo Credentials:
echo Admin:   admin@college.edu / admin123
echo Faculty: rajesh.verma@faculty.edu / faculty
echo Student: kabilkamble101@gmail.com / student
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F >nul 2>&1

echo.
echo All servers stopped. Press any key to exit...
pause >nul
