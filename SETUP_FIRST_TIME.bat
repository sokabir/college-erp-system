@echo off
title College ERP - First Time Setup
color 0B

echo ========================================
echo    College ERP System - Setup
echo ========================================
echo.
echo This will install dependencies and setup database.
echo This only needs to be run ONCE.
echo.
pause

echo.
echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)

echo.
echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Setting up Database...
cd ..
echo Please ensure MySQL is running and run this command:
echo mysql -u root -p college_erp ^< database_setup.sql
echo.
echo Press any key after database is imported...
pause >nul

echo.
echo [4/4] Creating Environment Files...
cd backend
if not exist .env (
    echo Creating backend .env file...
    (
        echo NODE_ENV=development
        echo PORT=5000
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=
        echo DB_NAME=college_erp
        echo JWT_SECRET=college_erp_secret_key_2024
        echo FRONTEND_URL=http://localhost:5173
    ) > .env
)

cd ..\frontend
if not exist .env (
    echo Creating frontend .env file...
    (
        echo VITE_API_URL=http://localhost:5000/api
    ) > .env
)

cd ..

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Update backend/.env with your MySQL password
echo 2. Run START_PROJECT.bat to launch the application
echo.
pause
