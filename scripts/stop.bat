@echo off
REM Script para detener ZenDash
REM Uso: stop.bat [force]

setlocal enabledelayedexpansion

set FORCE=%1

echo ========================================
echo   Deteniendo ZenDash
echo ========================================
echo.

set FOUND=0

REM Buscar procesos en puerto 3050 (Development)
echo Buscando procesos en puerto 3050...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3050" ^| findstr "LISTENING"') do (
    set PID=%%a
    if defined PID (
        set FOUND=1
        echo Proceso encontrado: PID !PID!
        if "%FORCE%"=="force" (
            echo Forzando cierre del proceso...
            taskkill /F /PID !PID! >nul 2>&1
        ) else (
            echo Cerrando proceso...
            taskkill /PID !PID! >nul 2>&1
        )

        if !errorLevel! equ 0 (
            echo [OK] Proceso detenido correctamente
        ) else (
            echo [ERROR] No se pudo detener el proceso
            echo Intenta con: stop.bat force
        )
    )
)

REM Buscar procesos en puerto 4173 (Preview)
echo Buscando procesos en puerto 4173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING"') do (
    set PID=%%a
    if defined PID (
        set FOUND=1
        echo Proceso encontrado: PID !PID!
        if "%FORCE%"=="force" (
            echo Forzando cierre del proceso...
            taskkill /F /PID !PID! >nul 2>&1
        ) else (
            echo Cerrando proceso...
            taskkill /PID !PID! >nul 2>&1
        )

        if !errorLevel! equ 0 (
            echo [OK] Proceso detenido correctamente
        ) else (
            echo [ERROR] No se pudo detener el proceso
            echo Intenta con: stop.bat force
        )
    )
)

REM Buscar procesos node.js relacionados con vite
echo Buscando procesos Node.js de Vite...
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST ^| findstr /C:"PID:"') do (
    set NODEPID=%%a
    if defined NODEPID (
        REM Verificar si el proceso esta usando vite
        wmic process where "ProcessId=!NODEPID!" get CommandLine 2>nul | findstr /I "vite" >nul
        if !errorLevel! equ 0 (
            set FOUND=1
            echo Proceso Vite encontrado: PID !NODEPID!
            if "%FORCE%"=="force" (
                taskkill /F /PID !NODEPID! >nul 2>&1
            ) else (
                taskkill /PID !NODEPID! >nul 2>&1
            )

            if !errorLevel! equ 0 (
                echo [OK] Proceso detenido correctamente
            ) else (
                echo [ERROR] No se pudo detener el proceso
            )
        )
    )
)

echo.
if %FOUND%==0 (
    echo No se encontraron procesos de ZenDash en ejecucion
) else (
    echo ========================================
    echo   ZenDash detenido
    echo ========================================
)

echo.
pause
