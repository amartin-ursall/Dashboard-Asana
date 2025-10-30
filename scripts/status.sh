#!/bin/bash

# Script para verificar el estado del Dashboard Asana

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Archivo PID
PID_FILE="./scripts/.app.pid"

# Puertos comunes
DEV_PORT=3050
PREVIEW_PORT=4173

echo -e "${BLUE}=== Dashboard Asana - Status ===${NC}"
echo ""

# Verificar por archivo PID
check_pid_file() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${GREEN}Estado: CORRIENDO${NC}"
            echo "PID: $PID"

            # Obtener información del proceso
            if command -v ps &> /dev/null; then
                echo ""
                echo "Detalles del proceso:"
                ps -p "$PID" -o pid,ppid,%cpu,%mem,etime,command | tail -n +2
            fi

            return 0
        else
            echo -e "${RED}Estado: DETENIDO${NC}"
            echo -e "${YELLOW}(Archivo PID obsoleto encontrado)${NC}"
            return 1
        fi
    else
        echo -e "${RED}Estado: DETENIDO${NC}"
        echo "(No se encontró archivo PID)"
        return 1
    fi
}

# Verificar puertos
check_ports() {
    echo ""
    echo -e "${BLUE}Verificando puertos:${NC}"

    # Puerto desarrollo
    if command -v lsof &> /dev/null; then
        DEV_CHECK=$(lsof -i :$DEV_PORT -sTCP:LISTEN -t 2>/dev/null || true)
        if [ ! -z "$DEV_CHECK" ]; then
            echo -e "Puerto $DEV_PORT (dev): ${GREEN}EN USO${NC} (PID: $DEV_CHECK)"
        else
            echo -e "Puerto $DEV_PORT (dev): ${YELLOW}LIBRE${NC}"
        fi

        PREVIEW_CHECK=$(lsof -i :$PREVIEW_PORT -sTCP:LISTEN -t 2>/dev/null || true)
        if [ ! -z "$PREVIEW_CHECK" ]; then
            echo -e "Puerto $PREVIEW_PORT (preview): ${GREEN}EN USO${NC} (PID: $PREVIEW_CHECK)"
        else
            echo -e "Puerto $PREVIEW_PORT (preview): ${YELLOW}LIBRE${NC}"
        fi
    elif command -v netstat &> /dev/null; then
        # Fallback para Windows/sistemas sin lsof
        echo "Verificando con netstat..."

        if netstat -an | grep -q ":$DEV_PORT.*LISTENING\|:$DEV_PORT.*ESTABLISHED"; then
            echo -e "Puerto $DEV_PORT (dev): ${GREEN}EN USO${NC}"
        else
            echo -e "Puerto $DEV_PORT (dev): ${YELLOW}LIBRE${NC}"
        fi

        if netstat -an | grep -q ":$PREVIEW_PORT.*LISTENING\|:$PREVIEW_PORT.*ESTABLISHED"; then
            echo -e "Puerto $PREVIEW_PORT (preview): ${GREEN}EN USO${NC}"
        else
            echo -e "Puerto $PREVIEW_PORT (preview): ${YELLOW}LIBRE${NC}"
        fi
    else
        echo -e "${YELLOW}No se puede verificar puertos (lsof/netstat no disponible)${NC}"
    fi
}

# Buscar procesos relacionados
check_related_processes() {
    echo ""
    echo -e "${BLUE}Procesos relacionados:${NC}"

    if command -v pgrep &> /dev/null; then
        VITE_PIDS=$(pgrep -f "vite" || true)
        if [ ! -z "$VITE_PIDS" ]; then
            echo -e "${GREEN}Procesos Vite encontrados:${NC}"
            ps -p $VITE_PIDS -o pid,%cpu,%mem,command | tail -n +2
        else
            echo "No se encontraron procesos Vite"
        fi
    elif command -v tasklist &> /dev/null; then
        # Windows
        echo "Procesos Node.js:"
        tasklist | grep -i "node.exe" || echo "No se encontraron procesos Node"
    else
        echo -e "${YELLOW}No se puede verificar procesos (pgrep/tasklist no disponible)${NC}"
    fi
}

# Verificar logs
check_logs() {
    echo ""
    echo -e "${BLUE}Archivos de log:${NC}"

    if [ -f "./scripts/dev.log" ]; then
        DEV_SIZE=$(du -h "./scripts/dev.log" | cut -f1)
        echo -e "dev.log: ${GREEN}Existe${NC} (Tamaño: $DEV_SIZE)"
        echo "Últimas 5 líneas:"
        tail -n 5 "./scripts/dev.log" | sed 's/^/  /'
    else
        echo "dev.log: No existe"
    fi

    if [ -f "./scripts/preview.log" ]; then
        PREVIEW_SIZE=$(du -h "./scripts/preview.log" | cut -f1)
        echo -e "preview.log: ${GREEN}Existe${NC} (Tamaño: $PREVIEW_SIZE)"
        echo "Últimas 5 líneas:"
        tail -n 5 "./scripts/preview.log" | sed 's/^/  /'
    else
        echo "preview.log: No existe"
    fi
}

# Verificar salud del sistema
check_system_health() {
    echo ""
    echo -e "${BLUE}Salud del sistema:${NC}"

    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        echo -e "Node.js: ${GREEN}$NODE_VERSION${NC}"
    else
        echo -e "Node.js: ${RED}NO INSTALADO${NC}"
    fi

    # npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        echo -e "npm: ${GREEN}$NPM_VERSION${NC}"
    else
        echo -e "npm: ${RED}NO INSTALADO${NC}"
    fi

    # Wrangler
    if command -v wrangler &> /dev/null; then
        WRANGLER_VERSION=$(wrangler --version 2>/dev/null || echo "installed")
        echo -e "Wrangler: ${GREEN}$WRANGLER_VERSION${NC}"
    else
        echo -e "Wrangler: ${YELLOW}NO INSTALADO${NC}"
    fi
}

# Mostrar URLs de acceso
show_access_info() {
    echo ""
    echo -e "${BLUE}URLs de acceso:${NC}"
    echo "Desarrollo:  http://localhost:$DEV_PORT"
    echo "Preview:     http://localhost:$PREVIEW_PORT"
    echo "Local:       http://0.0.0.0:$DEV_PORT (accesible desde red local)"
}

# Main
check_pid_file
check_ports
check_related_processes
check_logs
check_system_health
show_access_info

echo ""
echo -e "${GREEN}=== Fin del reporte ===${NC}"
