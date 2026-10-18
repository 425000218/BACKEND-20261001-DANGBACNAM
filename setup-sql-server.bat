@echo off
chcp 65001 > nul
title Thiet lap CSDL SQL Server - Chuong 06 (Auth & RBAC)
echo =======================================================================
echo   HE THONG CAU HINH CO SO DU LIEU SQL SERVER - CHUONG 06 (AUTH & RBAC)
echo   Backend Quan Ly Sinh Vien
echo =======================================================================
echo.
echo Dang mo PowerShell voi quyen Administrator...
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0setup-sql-server.ps1\"'"
