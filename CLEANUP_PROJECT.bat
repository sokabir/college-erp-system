@echo off
title Cleaning Up Project Files
color 0E

echo ========================================
echo    Project Cleanup - Remove Test Files
echo ========================================
echo.
echo This will remove all test, debug, and temporary files.
echo Your main application code will NOT be affected.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo Starting cleanup...
echo.

REM Backend cleanup
echo [1/3] Cleaning backend folder...
cd backend

REM Remove all test files
del /Q test_*.js 2>nul
del /Q check_*.js 2>nul
del /Q debug_*.js 2>nul
del /Q verify_*.js 2>nul

REM Remove migration/setup scripts
del /Q add_*.js 2>nul
del /Q fix_*.js 2>nul
del /Q create_*.js 2>nul
del /Q setup_*.js 2>nul
del /Q migrate_*.js 2>nul
del /Q update_*.js 2>nul
del /Q cleanup_*.js 2>nul
del /Q restructure_*.js 2>nul
del /Q remove_*.js 2>nul
del /Q reset_*.js 2>nul
del /Q publish_*.js 2>nul
del /Q assign_*.js 2>nul
del /Q auto_*.js 2>nul
del /Q run_*.js 2>nul

REM Remove other temporary files
del /Q db_manager.js 2>nul
del /Q server_error.log 2>nul

cd ..

REM Root folder cleanup
echo [2/3] Cleaning root folder...
del /Q create_leave_pages.ps1 2>nul
del /Q dummy_marksheet.pdf 2>nul
del /Q dummy_photo.jpg 2>nul

REM Documentation cleanup (keep only essential)
echo [3/3] Organizing documentation...
REM Keep these files - they're important for submission

echo.
echo ========================================
echo    Cleanup Complete!
echo ========================================
echo.
echo Removed:
echo - All test_*.js files
echo - All debug_*.js files
echo - All migration scripts
echo - All setup scripts
echo - Temporary files
echo.
echo Your project is now clean and ready for submission!
echo.
pause
