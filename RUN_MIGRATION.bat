@echo off
echo ========================================
echo Running Database Migration
echo ========================================
echo.
echo This will update the admission_applications table
echo to add new document columns.
echo.
pause

mysql -u root -p college_erp_v2 < update_admission_documents.sql

echo.
echo ========================================
echo Migration Complete!
echo ========================================
echo.
pause
