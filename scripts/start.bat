@echo off
REM Script para iniciar ZenDash
REM Uso: start.bat [dev|preview]

setlocal enabledelayedexpansion

REM Configurar modo (por defecto: dev)
set MODE=%1
if "%MODE%"=="" set MODE=dev

echo ========================================
echo   Iniciando ZenDash
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm esta disponible
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

REM Verificar si hay un servicio ya corriendo
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3050" ^| findstr "LISTENING"') do (
    set PID=%%a
    if defined PID (
        echo Advertencia: Ya hay un servicio corriendo en el puerto 3050 ^(PID: !PID!^)
        echo Usa stop.bat para detenerlo primero
        pause
        exit /b 1
    )
)

echo Modo seleccionado: %MODE%
echo.

if "%MODE%"=="dev" (
    echo Iniciando servidor de desarrollo en http://localhost:3050
    echo Presiona Ctrl+C para detener
    echo.
    npm run dev
) else if "%MODE%"=="preview" (
    echo Iniciando servidor de preview en http://localhost:4173
    echo Presiona Ctrl+C para detener
    echo.
    npm run preview
) else (
    echo ERROR: Modo no valido. Usa: start.bat [dev^|preview]
    pause
    exit /b 1
)
