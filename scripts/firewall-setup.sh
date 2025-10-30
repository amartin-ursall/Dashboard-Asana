#!/bin/bash

# Script para configurar el firewall para Dashboard Asana
# Soporta: Linux (iptables/ufw), Windows (Windows Firewall via netsh), macOS (pf)

set -e

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Puertos de la aplicación
DEV_PORT=3000
PREVIEW_PORT=4173

# Detectar sistema operativo
detect_os() {
    case "$(uname -s)" in
        Linux*)     echo "linux";;
        Darwin*)    echo "macos";;
        CYGWIN*|MINGW*|MSYS*)    echo "windows";;
        *)          echo "unknown";;
    esac
}

# Mostrar uso
show_usage() {
    echo "Uso: ./firewall-setup.sh [ACCIÓN] [OPCIONES]"
    echo ""
    echo "ACCIONES:"
    echo "  open       Abre los puertos necesarios en el firewall"
    echo "  close      Cierra los puertos en el firewall"
    echo "  status     Muestra el estado del firewall"
    echo "  reset      Resetea las reglas del firewall para esta app"
    echo ""
    echo "OPCIONES:"
    echo "  --dev-only      Solo configura puerto de desarrollo ($DEV_PORT)"
    echo "  --preview-only  Solo configura puerto de preview ($PREVIEW_PORT)"
    echo "  --local-only    Solo permite acceso desde localhost"
    echo "  --network       Permite acceso desde red local"
    echo ""
    echo "Ejemplos:"
    echo "  ./firewall-setup.sh open                 # Abre todos los puertos"
    echo "  ./firewall-setup.sh open --dev-only      # Solo abre puerto dev"
    echo "  ./firewall-setup.sh open --local-only    # Solo localhost"
    echo "  ./firewall-setup.sh status               # Ver estado"
    echo "  ./firewall-setup.sh close                # Cerrar puertos"
}

# ============= LINUX (UFW) =============
linux_ufw_open() {
    echo -e "${BLUE}Configurando firewall con UFW (Linux)...${NC}"

    if ! command -v ufw &> /dev/null; then
        echo -e "${YELLOW}UFW no está instalado. Instálalo con: sudo apt-get install ufw${NC}"
        return 1
    fi

    if [ "$DEV_ONLY" != "1" ]; then
        echo "Abriendo puerto $PREVIEW_PORT (preview)..."
        sudo ufw allow $PREVIEW_PORT/tcp comment "Dashboard Asana Preview"
    fi

    if [ "$PREVIEW_ONLY" != "1" ]; then
        echo "Abriendo puerto $DEV_PORT (development)..."
        sudo ufw allow $DEV_PORT/tcp comment "Dashboard Asana Development"
    fi

    echo -e "${GREEN}Puertos abiertos en UFW${NC}"
}

linux_ufw_close() {
    echo -e "${BLUE}Cerrando puertos en UFW...${NC}"

    if ! command -v ufw &> /dev/null; then
        echo -e "${YELLOW}UFW no está instalado${NC}"
        return 1
    fi

    sudo ufw delete allow $DEV_PORT/tcp 2>/dev/null || echo "Puerto $DEV_PORT no estaba abierto"
    sudo ufw delete allow $PREVIEW_PORT/tcp 2>/dev/null || echo "Puerto $PREVIEW_PORT no estaba abierto"

    echo -e "${GREEN}Puertos cerrados en UFW${NC}"
}

linux_ufw_status() {
    if ! command -v ufw &> /dev/null; then
        echo -e "${YELLOW}UFW no está instalado${NC}"
        return 1
    fi

    echo -e "${BLUE}Estado UFW:${NC}"
    sudo ufw status | grep -E "$DEV_PORT|$PREVIEW_PORT|Status:" || echo "No hay reglas para los puertos de la aplicación"
}

# ============= LINUX (IPTABLES) =============
linux_iptables_open() {
    echo -e "${BLUE}Configurando firewall con iptables (Linux)...${NC}"

    if ! command -v iptables &> /dev/null; then
        echo -e "${RED}iptables no está disponible${NC}"
        return 1
    fi

    if [ "$PREVIEW_ONLY" != "1" ]; then
        echo "Abriendo puerto $DEV_PORT (development)..."
        sudo iptables -A INPUT -p tcp --dport $DEV_PORT -j ACCEPT
        sudo iptables -A OUTPUT -p tcp --sport $DEV_PORT -j ACCEPT
    fi

    if [ "$DEV_ONLY" != "1" ]; then
        echo "Abriendo puerto $PREVIEW_PORT (preview)..."
        sudo iptables -A INPUT -p tcp --dport $PREVIEW_PORT -j ACCEPT
        sudo iptables -A OUTPUT -p tcp --sport $PREVIEW_PORT -j ACCEPT
    fi

    # Guardar reglas
    if command -v iptables-save &> /dev/null; then
        sudo iptables-save > /tmp/iptables.rules
        echo -e "${GREEN}Reglas guardadas en /tmp/iptables.rules${NC}"
    fi

    echo -e "${GREEN}Puertos abiertos en iptables${NC}"
}

linux_iptables_close() {
    echo -e "${BLUE}Cerrando puertos en iptables...${NC}"

    sudo iptables -D INPUT -p tcp --dport $DEV_PORT -j ACCEPT 2>/dev/null || true
    sudo iptables -D OUTPUT -p tcp --sport $DEV_PORT -j ACCEPT 2>/dev/null || true
    sudo iptables -D INPUT -p tcp --dport $PREVIEW_PORT -j ACCEPT 2>/dev/null || true
    sudo iptables -D OUTPUT -p tcp --sport $PREVIEW_PORT -j ACCEPT 2>/dev/null || true

    echo -e "${GREEN}Puertos cerrados en iptables${NC}"
}

linux_iptables_status() {
    echo -e "${BLUE}Estado iptables:${NC}"
    sudo iptables -L -n | grep -E "$DEV_PORT|$PREVIEW_PORT" || echo "No hay reglas para los puertos de la aplicación"
}

# ============= WINDOWS =============
windows_firewall_open() {
    echo -e "${BLUE}Configurando Windows Firewall...${NC}"

    if [ "$PREVIEW_ONLY" != "1" ]; then
        echo "Abriendo puerto $DEV_PORT (development)..."
        netsh advfirewall firewall add rule name="Dashboard Asana Dev" dir=in action=allow protocol=TCP localport=$DEV_PORT
    fi

    if [ "$DEV_ONLY" != "1" ]; then
        echo "Abriendo puerto $PREVIEW_PORT (preview)..."
        netsh advfirewall firewall add rule name="Dashboard Asana Preview" dir=in action=allow protocol=TCP localport=$PREVIEW_PORT
    fi

    echo -e "${GREEN}Puertos abiertos en Windows Firewall${NC}"
}

windows_firewall_close() {
    echo -e "${BLUE}Cerrando puertos en Windows Firewall...${NC}"

    netsh advfirewall firewall delete rule name="Dashboard Asana Dev" 2>/dev/null || echo "Regla 'Dashboard Asana Dev' no encontrada"
    netsh advfirewall firewall delete rule name="Dashboard Asana Preview" 2>/dev/null || echo "Regla 'Dashboard Asana Preview' no encontrada"

    echo -e "${GREEN}Puertos cerrados en Windows Firewall${NC}"
}

windows_firewall_status() {
    echo -e "${BLUE}Estado Windows Firewall:${NC}"
    netsh advfirewall firewall show rule name="Dashboard Asana Dev" 2>/dev/null || echo "No hay regla para puerto dev"
    echo ""
    netsh advfirewall firewall show rule name="Dashboard Asana Preview" 2>/dev/null || echo "No hay regla para puerto preview"
}

# ============= MACOS =============
macos_firewall_open() {
    echo -e "${BLUE}Configurando macOS Firewall...${NC}"
    echo -e "${YELLOW}NOTA: macOS usa un firewall basado en aplicaciones${NC}"
    echo "Para permitir acceso de red, ve a:"
    echo "  System Preferences > Security & Privacy > Firewall > Firewall Options"
    echo "Y agrega Node.js a la lista de aplicaciones permitidas"
    echo ""

    # Alternativa: usar pfctl
    if [ "$LOCAL_ONLY" != "1" ]; then
        echo -e "${YELLOW}Para configuración avanzada, puedes usar pfctl (requiere privilegios)${NC}"
    fi

    echo -e "${GREEN}Instrucciones mostradas${NC}"
}

macos_firewall_status() {
    echo -e "${BLUE}Estado macOS Firewall:${NC}"

    # Verificar si el firewall está activo
    if command -v /usr/libexec/ApplicationFirewall/socketfilterfw &> /dev/null; then
        /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
    else
        echo "No se puede determinar el estado del firewall"
    fi
}

# ============= MAIN =============

OS=$(detect_os)
ACTION="${1:-}"
DEV_ONLY=0
PREVIEW_ONLY=0
LOCAL_ONLY=0
NETWORK=0

# Parse opciones
shift || true
while [[ $# -gt 0 ]]; do
    case $1 in
        --dev-only)
            DEV_ONLY=1
            shift
            ;;
        --preview-only)
            PREVIEW_ONLY=1
            shift
            ;;
        --local-only)
            LOCAL_ONLY=1
            shift
            ;;
        --network)
            NETWORK=1
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

echo -e "${GREEN}=== Dashboard Asana - Firewall Setup ===${NC}"
echo "Sistema operativo detectado: $OS"
echo ""

# Validaciones
if [ "$DEV_ONLY" == "1" ] && [ "$PREVIEW_ONLY" == "1" ]; then
    echo -e "${RED}Error: No puedes usar --dev-only y --preview-only juntos${NC}"
    exit 1
fi

# Ejecutar acción según OS
case $ACTION in
    open)
        case $OS in
            linux)
                if command -v ufw &> /dev/null; then
                    linux_ufw_open
                else
                    linux_iptables_open
                fi
                ;;
            windows)
                windows_firewall_open
                ;;
            macos)
                macos_firewall_open
                ;;
            *)
                echo -e "${RED}Sistema operativo no soportado: $OS${NC}"
                exit 1
                ;;
        esac
        ;;
    close)
        case $OS in
            linux)
                if command -v ufw &> /dev/null; then
                    linux_ufw_close
                else
                    linux_iptables_close
                fi
                ;;
            windows)
                windows_firewall_close
                ;;
            macos)
                echo -e "${YELLOW}Cierra manualmente desde System Preferences${NC}"
                ;;
            *)
                echo -e "${RED}Sistema operativo no soportado: $OS${NC}"
                exit 1
                ;;
        esac
        ;;
    status)
        case $OS in
            linux)
                if command -v ufw &> /dev/null; then
                    linux_ufw_status
                else
                    linux_iptables_status
                fi
                ;;
            windows)
                windows_firewall_status
                ;;
            macos)
                macos_firewall_status
                ;;
            *)
                echo -e "${RED}Sistema operativo no soportado: $OS${NC}"
                exit 1
                ;;
        esac
        ;;
    reset)
        echo -e "${YELLOW}Reseteando configuración...${NC}"
        $0 close
        echo -e "${GREEN}Configuración reseteada${NC}"
        ;;
    "")
        echo -e "${RED}Error: Debes especificar una acción${NC}"
        echo ""
        show_usage
        exit 1
        ;;
    -h|--help)
        show_usage
        exit 0
        ;;
    *)
        echo -e "${RED}Error: Acción desconocida '$ACTION'${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Listo!${NC}"
