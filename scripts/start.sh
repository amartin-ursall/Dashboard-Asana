#!/bin/bash

# Script para iniciar el Dashboard Asana
# Soporta modo desarrollo y producción

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
    echo "Uso: ./start.sh [MODO]"
    echo ""
    echo "MODOS:"
    echo "  dev        Inicia en modo desarrollo (puerto 3050)"
    echo "  preview    Inicia en modo preview (puerto 4173)"
    echo "  prod       Deploy a Cloudflare Workers"
    echo ""
    echo "Ejemplo: ./start.sh dev"
}

# Verificar si ya está corriendo
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${RED}Error: La aplicación ya está corriendo (PID: $PID)${NC}"
            echo "Usa ./scripts/stop.sh para detenerla primero"
            exit 1
        else
            # Eliminar PID file obsoleto
            rm -f "$PID_FILE"
        fi
    fi
}

# Modo desarrollo
start_dev() {
    echo -e "${GREEN}Iniciando Dashboard Asana en modo DESARROLLO...${NC}"
    echo "Puerto: 3050"
    echo "Host: 0.0.0.0"
    echo ""

    check_running

    # Iniciar en background y guardar PID
    npm run dev > ./scripts/dev.log 2>&1 &
    echo $! > "$PID_FILE"

    sleep 2

    echo -e "${GREEN}Aplicación iniciada!${NC}"
    echo "PID: $(cat $PID_FILE)"
    echo "URL: http://localhost:3050"
    echo "Logs: ./scripts/dev.log"
}

# Modo preview
start_preview() {
    echo -e "${GREEN}Iniciando Dashboard Asana en modo PREVIEW...${NC}"
    echo ""

    check_running

    echo "Construyendo aplicación..."
    npm run build

    # Iniciar preview en background
    npm run preview > ./scripts/preview.log 2>&1 &
    echo $! > "$PID_FILE"

    sleep 2

    echo -e "${GREEN}Aplicación iniciada!${NC}"
    echo "PID: $(cat $PID_FILE)"
    echo "URL: http://localhost:4173"
    echo "Logs: ./scripts/preview.log"
}

# Deploy a producción
start_prod() {
    echo -e "${GREEN}Desplegando Dashboard Asana a Cloudflare Workers...${NC}"
    echo ""

    echo -e "${YELLOW}ADVERTENCIA: Esto desplegará la aplicación a producción${NC}"
    read -p "¿Continuar? (y/n) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deploy cancelado"
        exit 0
    fi

    echo "Desplegando..."
    npm run deploy

    echo -e "${GREEN}Deploy completado!${NC}"
}

# Main
MODE="${1:-dev}"

case $MODE in
    dev)
        start_dev
        ;;
    preview)
        start_preview
        ;;
    prod|production|deploy)
        start_prod
        ;;
    -h|--help)
        show_usage
        ;;
    *)
        echo -e "${RED}Error: Modo desconocido '$MODE'${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
