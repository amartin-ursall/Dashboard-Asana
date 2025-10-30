# Scripts de Gestión - Dashboard Asana

Este directorio contiene scripts para gestionar la aplicación Dashboard Asana de manera fácil y eficiente.

## Scripts Disponibles

### 1. start.sh - Iniciar la Aplicación

Inicia la aplicación en diferentes modos.

**Uso:**
```bash
./scripts/start.sh [MODO]
```

**Modos disponibles:**
- `dev` - Modo desarrollo (puerto 3050) - **Por defecto**
- `preview` - Modo preview (puerto 4173)
- `prod` - Deploy a Cloudflare Workers

**Ejemplos:**
```bash
# Iniciar en modo desarrollo
./scripts/start.sh
./scripts/start.sh dev

# Iniciar en modo preview
./scripts/start.sh preview

# Deploy a producción
./scripts/start.sh prod
```

**Características:**
- Verifica que no haya otra instancia corriendo
- Guarda el PID del proceso para control posterior
- Genera logs en `./scripts/dev.log` o `./scripts/preview.log`
- Confirmación antes de deploy a producción

---

### 2. stop.sh - Detener la Aplicación

Detiene la aplicación que está corriendo.

**Uso:**
```bash
./scripts/stop.sh [OPCIONES]
```

**Opciones:**
- `-f, --force` - Fuerza la detención de todos los procesos relacionados
- `-h, --help` - Muestra ayuda

**Ejemplos:**
```bash
# Detener aplicación normal
./scripts/stop.sh

# Forzar detención de todos los procesos
./scripts/stop.sh --force
```

**Características:**
- Intenta detención graceful primero
- Opción para eliminar archivos de log
- Detecta y elimina procesos huérfanos
- Soporte multiplataforma (Linux/Windows/macOS)

---

### 3. status.sh - Ver Estado

Muestra información detallada sobre el estado de la aplicación.

**Uso:**
```bash
./scripts/status.sh
```

**Información mostrada:**
- Estado de la aplicación (corriendo/detenido)
- PID del proceso
- Uso de CPU y memoria
- Estado de puertos (3050 y 4173)
- Procesos relacionados (Vite, Node)
- Contenido de logs
- Versiones instaladas (Node, npm, Wrangler)
- URLs de acceso

**Ejemplo de salida:**
```
=== Dashboard Asana - Status ===

Estado: CORRIENDO
PID: 12345

Detalles del proceso:
  PID    PPID  %CPU  %MEM    ETIME  COMMAND
12345   11234   5.2   1.3  00:15:30  node vite

Verificando puertos:
Puerto 3050 (dev): EN USO (PID: 12345)
Puerto 4173 (preview): LIBRE

...
```

---

### 4. firewall-setup.sh - Configurar Firewall

Configura el firewall del sistema para permitir/denegar acceso a la aplicación.

**Uso:**
```bash
./scripts/firewall-setup.sh [ACCIÓN] [OPCIONES]
```

**Acciones:**
- `open` - Abre los puertos en el firewall
- `close` - Cierra los puertos
- `status` - Muestra el estado del firewall
- `reset` - Resetea las reglas del firewall

**Opciones:**
- `--dev-only` - Solo puerto de desarrollo (3050)
- `--preview-only` - Solo puerto de preview (4173)
- `--local-only` - Solo acceso desde localhost
- `--network` - Permite acceso desde red local

**Ejemplos:**
```bash
# Abrir todos los puertos
./scripts/firewall-setup.sh open

# Abrir solo puerto de desarrollo
./scripts/firewall-setup.sh open --dev-only

# Ver estado del firewall
./scripts/firewall-setup.sh status

# Cerrar todos los puertos
./scripts/firewall-setup.sh close

# Resetear configuración
./scripts/firewall-setup.sh reset
```

**Soporte multiplataforma:**
- **Linux**: UFW o iptables
- **Windows**: Windows Firewall (netsh)
- **macOS**: Instrucciones para configuración manual

**Nota importante para Windows:**
En Windows, es posible que necesites ejecutar Git Bash como Administrador para que los comandos del firewall funcionen.

---

## Flujo de Trabajo Típico

### Desarrollo Local

1. **Iniciar aplicación:**
   ```bash
   ./scripts/start.sh dev
   ```

2. **Verificar estado:**
   ```bash
   ./scripts/status.sh
   ```

3. **Detener cuando termines:**
   ```bash
   ./scripts/stop.sh
   ```

### Compartir en Red Local

1. **Configurar firewall:**
   ```bash
   ./scripts/firewall-setup.sh open --network
   ```

2. **Iniciar aplicación:**
   ```bash
   ./scripts/start.sh dev
   ```

3. **Acceder desde otro dispositivo:**
   - Encuentra tu IP local: `ipconfig` (Windows) o `ifconfig` (Linux/Mac)
   - Accede a: `http://<tu-ip>:3050`

### Deploy a Producción

1. **Verificar que todo esté bien:**
   ```bash
   ./scripts/status.sh
   npm run build
   ```

2. **Deploy:**
   ```bash
   ./scripts/start.sh prod
   ```

---

## Archivos Generados

Los scripts generan estos archivos en el directorio `scripts/`:

- `.app.pid` - Almacena el PID de la aplicación corriendo
- `dev.log` - Log del modo desarrollo
- `preview.log` - Log del modo preview

**Nota:** Estos archivos se limpian automáticamente al detener la aplicación.

---

## Troubleshooting

### La aplicación no inicia

1. Verifica que no haya otra instancia corriendo:
   ```bash
   ./scripts/status.sh
   ```

2. Si hay procesos huérfanos, detenlos:
   ```bash
   ./scripts/stop.sh --force
   ```

3. Verifica que el puerto no esté siendo usado por otra aplicación

### No puedo acceder desde otro dispositivo

1. Verifica el firewall:
   ```bash
   ./scripts/firewall-setup.sh status
   ```

2. Abre los puertos si están cerrados:
   ```bash
   ./scripts/firewall-setup.sh open --network
   ```

3. Verifica que la aplicación esté escuchando en 0.0.0.0:
   ```bash
   ./scripts/status.sh
   ```

### Errores de permisos (Linux/macOS)

Los comandos de firewall requieren privilegios de administrador:

```bash
sudo ./scripts/firewall-setup.sh open
```

---

## Requisitos

- **Bash**: Git Bash (Windows), Bash nativo (Linux/macOS)
- **Node.js**: v16 o superior
- **npm**: Incluido con Node.js
- **Permisos**: Administrador para configurar firewall

---

## Notas de Compatibilidad

### Windows
- Usa Git Bash para ejecutar los scripts
- Algunos comandos requieren ejecutar como Administrador
- El firewall usa `netsh` internamente

### Linux
- Soporta UFW y iptables
- Comandos de firewall requieren `sudo`

### macOS
- El firewall es basado en aplicaciones
- Configuración manual recomendada desde System Preferences

---

## Contribuir

Si encuentras problemas o quieres mejorar los scripts:

1. Verifica el código en `scripts/*.sh`
2. Los scripts usan colores ANSI para mejor visualización
3. Cada script tiene funciones bien documentadas
4. Sigue el estilo de código existente

---

## Licencia

Estos scripts son parte del proyecto Dashboard Asana.
