@echo off
REM Script para cerrar el Firewall de Windows para ZenDash
REM Ejecutar como Administrador

echo ========================================
echo   Cierre del Firewall - ZenDash
echo ========================================
echo.

REM Verificar permisos de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Este script requiere permisos de administrador
    echo Por favor, ejecuta como administrador
    pause
    exit /b 1
)

echo Eliminando reglas del firewall...
echo.

REM Eliminar regla del puerto 3050
echo [1/2] Eliminando regla del puerto 3050...
netsh advfirewall firewall delete rule name="ZenDash Dev Server" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Regla del puerto 3050 eliminada
) else (
    echo [INFO] No se encontro regla para el puerto 3050
)
echo.

REM Eliminar regla del puerto 4173
echo [2/2] Eliminando regla del puerto 4173...
netsh advfirewall firewall delete rule name="ZenDash Preview Server" >nul 2>&1
if %errorLevel% equ 0 (
    echo [OK] Regla del puerto 4173 eliminada
) else (
    echo [INFO] No se encontro regla para el puerto 4173
)
echo.

echo ========================================
echo   Firewall cerrado
echo ========================================
echo.
echo La aplicacion ya no es accesible desde la red local
echo Solo estara disponible en localhost
echo.

pause
