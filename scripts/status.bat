@echo off
REM Script para verificar el estado de ZenDash

setlocal enabledelayedexpansion

echo ========================================
echo   Estado de ZenDash
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%v in ('node --version 2^>nul') do set NODE_VERSION=%%v
    echo [OK] Node.js: !NODE_VERSION!
) else (
    echo [X] Node.js: No instalado
)

REM Verificar npm
where npm >nul 2>&1
if %errorLevel% equ 0 (
    for /f "tokens=*" %%v in ('npm --version 2^>nul') do set NPM_VERSION=%%v
    echo [OK] npm: !NPM_VERSION!
) else (
    echo [X] npm: No disponible
)

echo.
echo ----------------------------------------
echo   Estado de Puertos
echo ----------------------------------------

REM Verificar puerto 3050 (Development)
set PORT_3050_STATUS=Cerrado
set PORT_3050_PID=N/A
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3050" ^| findstr "LISTENING" 2^>nul') do (
    set PORT_3050_STATUS=Abierto
    set PORT_3050_PID=%%a
)
echo Puerto 3050 (Dev):     !PORT_3050_STATUS! ^(PID: !PORT_3050_PID!^)

REM Verificar puerto 4173 (Preview)
set PORT_4173_STATUS=Cerrado
set PORT_4173_PID=N/A
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4173" ^| findstr "LISTENING" 2^>nul') do (
    set PORT_4173_STATUS=Abierto
    set PORT_4173_PID=%%a
)
echo Puerto 4173 (Preview): !PORT_4173_STATUS! ^(PID: !PORT_4173_PID!^)

echo.
echo ----------------------------------------
echo   Procesos Node.js/Vite
echo ----------------------------------------

set FOUND_VITE=0
for /f "tokens=2" %%a in ('tasklist /FI "IMAGENAME eq node.exe" /FO LIST 2^>nul ^| findstr /C:"PID:"') do (
    set NODEPID=%%a
    if defined NODEPID (
        wmic process where "ProcessId=!NODEPID!" get CommandLine 2>nul | findstr /I "vite" >nul
        if !errorLevel! equ 0 (
            set FOUND_VITE=1
            for /f "tokens=*" %%c in ('wmic process where "ProcessId=!NODEPID!" get CommandLine /format:list 2^>nul ^| findstr "CommandLine"') do (
                echo PID !NODEPID!: %%c
            )
        )
    )
)

if !FOUND_VITE!==0 (
    echo No hay procesos Vite en ejecucion
)

echo.
echo ----------------------------------------
echo   Estado del Firewall
echo ----------------------------------------

REM Verificar reglas del firewall
netsh advfirewall firewall show rule name="ZenDash Dev Server" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Regla "ZenDash Dev Server" configurada
) else (
    echo [X] Regla "ZenDash Dev Server" no encontrada
)

netsh advfirewall firewall show rule name="ZenDash Preview Server" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Regla "ZenDash Preview Server" configurada
) else (
    echo [X] Regla "ZenDash Preview Server" no encontrada
)

echo.
echo ----------------------------------------
echo   Resumen
echo ----------------------------------------

if "!PORT_3050_STATUS!"=="Abierto" (
    echo [ACTIVO] Servidor de desarrollo en http://localhost:3050
    ipconfig | findstr /C:"IPv4" | findstr /V "127.0.0.1" >nul 2>&1
    if !errorLevel! equ 0 (
        for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
            set IP=%%i
            set IP=!IP: =!
            echo          Accesible en: http://!IP!:3050
        )
    )
) else if "!PORT_4173_STATUS!"=="Abierto" (
    echo [ACTIVO] Servidor de preview en http://localhost:4173
    ipconfig | findstr /C:"IPv4" | findstr /V "127.0.0.1" >nul 2>&1
    if !errorLevel! equ 0 (
        for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /C:"IPv4" ^| findstr /V "127.0.0.1"') do (
            set IP=%%i
            set IP=!IP: =!
            echo          Accesible en: http://!IP!:4173
        )
    )
) else (
    echo [INACTIVO] No hay servidores en ejecucion
    echo.
    echo Para iniciar: scripts\start.bat [dev^|preview]
)

echo.
echo ========================================
pause
