@echo off
REM Script para configurar el Firewall de Windows para ZenDash
REM Ejecutar como Administrador

echo ========================================
echo   Configuracion del Firewall - ZenDash
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

echo Configurando reglas del firewall...
echo.

REM Eliminar reglas existentes si existen
netsh advfirewall firewall delete rule name="ZenDash Dev Server" >nul 2>&1
netsh advfirewall firewall delete rule name="ZenDash Preview Server" >nul 2>&1

REM Crear regla para el puerto 3050 (Development)
echo [1/2] Configurando puerto 3050 (Development)...
netsh advfirewall firewall add rule name="ZenDash Dev Server" dir=in action=allow protocol=TCP localport=3050 enable=yes profile=private,public
if %errorLevel% equ 0 (
    echo [OK] Puerto 3050 configurado correctamente
) else (
    echo [ERROR] No se pudo configurar el puerto 3050
)
echo.

REM Crear regla para el puerto 4173 (Preview)
echo [2/2] Configurando puerto 4173 (Preview)...
netsh advfirewall firewall add rule name="ZenDash Preview Server" dir=in action=allow protocol=TCP localport=4173 enable=yes profile=private,public
if %errorLevel% equ 0 (
    echo [OK] Puerto 4173 configurado correctamente
) else (
    echo [ERROR] No se pudo configurar el puerto 4173
)
echo.

echo ========================================
echo   Configuracion completada
echo ========================================
echo.
echo La aplicacion ahora es accesible en red local:
echo   - Dev:     http://[tu-ip]:3050
echo   - Preview: http://[tu-ip]:4173
echo.

pause
