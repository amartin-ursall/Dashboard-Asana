#!/bin/bash

# Script para detener el Dashboard Asana

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Archivo PID
PID_FILE="./scripts/.app.pid"

# Función para mostrar uso
show_usage() {
    echo "Uso: ./stop.sh [OPCIONES]"
    echo ""
    echo "OPCIONES:"
    echo "  -f, --force    Fuerza la detención de todos los procesos Node/Vite"
    echo "  -h, --help     Muestra esta ayuda"
    echo ""
}

# Detener por PID
stop_by_pid() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${YELLOW}No se encontró archivo PID${NC}"
        echo "La aplicación podría no estar corriendo, o fue iniciada manualmente"
        return 1
    fi

    PID=$(cat "$PID_FILE")

    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}Deteniendo aplicación (PID: $PID)...${NC}"

        # Intenta detener gracefully
        kill "$PID" 2>/dev/null || true

        # Esperar hasta 10 segundos
        for i in {1..10}; do
            if ! ps -p "$PID" > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done

        # Si sigue corriendo, forzar detención
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}Forzando detención...${NC}"
            kill -9 "$PID" 2>/dev/null || true
        fi

        rm -f "$PID_FILE"
        echo -e "${GREEN}Aplicación detenida exitosamente${NC}"
        return 0
    else
        echo -e "${YELLOW}El proceso PID $PID no está corriendo${NC}"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Detener todos los procesos relacionados
force_stop() {
    echo -e "${YELLOW}Buscando y deteniendo todos los procesos relacionados...${NC}"

    STOPPED=0

    # Buscar procesos de Vite
    if command -v pgrep &> /dev/null; then
        VITE_PIDS=$(pgrep -f "vite.*--host 0.0.0.0" || true)
        if [ ! -z "$VITE_PIDS" ]; then
            echo "Deteniendo procesos Vite: $VITE_PIDS"
            echo "$VITE_PIDS" | xargs kill 2>/dev/null || true
            STOPPED=1
        fi

        # Buscar procesos de Node que puedan ser esta app
        NODE_PIDS=$(pgrep -f "node.*vite" || true)
        if [ ! -z "$NODE_PIDS" ]; then
            echo "Deteniendo procesos Node/Vite: $NODE_PIDS"
            echo "$NODE_PIDS" | xargs kill 2>/dev/null || true
            STOPPED=1
        fi
    else
        # Fallback para sistemas sin pgrep
        if command -v tasklist &> /dev/null; then
            # Windows
            echo "Deteniendo procesos en Windows..."
            taskkill //F //IM node.exe //FI "WINDOWTITLE eq vite*" 2>/dev/null || true
            STOPPED=1
        fi
    fi

    # Limpiar archivo PID
    rm -f "$PID_FILE"

    if [ $STOPPED -eq 1 ]; then
        echo -e "${GREEN}Procesos detenidos${NC}"
    else
        echo -e "${YELLOW}No se encontraron procesos corriendo${NC}"
    fi
}

# Limpiar logs viejos (opcional)
cleanup_logs() {
    if [ -f "./scripts/dev.log" ] || [ -f "./scripts/preview.log" ]; then
        read -p "¿Eliminar archivos de log? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f ./scripts/dev.log ./scripts/preview.log
            echo -e "${GREEN}Logs eliminados${NC}"
        fi
    fi
}

# Main
FORCE=0

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--force)
            FORCE=1
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}Opción desconocida: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

echo -e "${GREEN}=== Dashboard Asana - Stop ===${NC}"
echo ""

if [ $FORCE -eq 1 ]; then
    force_stop
else
    if ! stop_by_pid; then
        echo ""
        echo -e "${YELLOW}Sugerencia: Usa './stop.sh --force' para detener todos los procesos relacionados${NC}"
    fi
fi

echo ""
cleanup_logs

echo ""
echo -e "${GREEN}Listo!${NC}"
