# Scripts de Windows para ZenDash

Scripts batch (.bat) para gestionar la aplicación ZenDash en Windows.

## Scripts Disponibles

### 🔥 Firewall

#### `firewall-config.bat`
Configura el Firewall de Windows para permitir acceso desde la red local.

```batch
# Ejecutar como Administrador
scripts\firewall-config.bat
```

**Requiere permisos de administrador**

Configura:
- Puerto 3050 (Development)
- Puerto 4173 (Preview)

#### `firewall-close.bat`
Elimina las reglas del firewall y cierra el acceso desde la red.

```batch
# Ejecutar como Administrador
scripts\firewall-close.bat
```

**Requiere permisos de administrador**

---

### ▶️ Inicio del Servicio

#### `start.bat`
Inicia la aplicación ZenDash.

```batch
# Modo desarrollo (puerto 3050)
scripts\start.bat dev

# Modo preview (puerto 4173)
scripts\start.bat preview

# Por defecto: modo desarrollo
scripts\start.bat
```

**URLs:**
- Development: `http://localhost:3050`
- Preview: `http://localhost:4173`

---

### ⏹️ Detener el Servicio

#### `stop.bat`
Detiene todos los procesos de ZenDash en ejecución.

```batch
# Cierre normal
scripts\stop.bat

# Cierre forzado (si el normal no funciona)
scripts\stop.bat force
```

Detiene:
- Procesos en puerto 3050
- Procesos en puerto 4173
- Procesos Node.js de Vite

---

### 📊 Estado del Servicio

#### `status.bat`
Muestra información completa sobre el estado de la aplicación.

```batch
scripts\status.bat
```

**Información mostrada:**
- Versión de Node.js y npm
- Estado de puertos (3050 y 4173)
- Procesos Vite en ejecución
- Reglas del firewall
- IP de acceso en red local

---

## Flujo de Trabajo Típico

### Primera Configuración

1. **Configurar el firewall** (como Administrador):
   ```batch
   scripts\firewall-config.bat
   ```

2. **Iniciar el servidor**:
   ```batch
   scripts\start.bat dev
   ```

3. **Verificar estado**:
   ```batch
   scripts\status.bat
   ```

### Uso Diario

```batch
# Iniciar desarrollo
scripts\start.bat dev

# Ver estado
scripts\status.bat

# Detener cuando termines
scripts\stop.bat
```

### Acceso desde Red Local

Después de configurar el firewall, la aplicación será accesible desde otros dispositivos:

1. Ejecuta `scripts\status.bat` para ver tu IP local
2. Accede desde otro dispositivo: `http://[TU-IP]:3050`

Ejemplo: `http://192.168.1.100:3050`

---

## Requisitos

- Windows 7 o superior
- Node.js v18+ instalado
- Permisos de administrador (solo para firewall)

---

## Solución de Problemas

### Error: "Puerto ya en uso"

```batch
# Ver qué proceso está usando el puerto
scripts\status.bat

# Detener el proceso
scripts\stop.bat force
```

### Error: "Node.js no está instalado"

Instala Node.js desde: https://nodejs.org/

### Error: "Requiere permisos de administrador"

Clic derecho en el script → "Ejecutar como administrador"

### El firewall no permite conexiones

1. Verifica que ejecutaste como administrador
2. Verifica las reglas: `scripts\status.bat`
3. Revisa la configuración del antivirus

---

## Integración con npm

Estos scripts también están disponibles como comandos npm:

```json
{
  "scripts": {
    "start": "bash scripts/start.sh",
    "stop": "bash scripts/stop.sh",
    "status": "bash scripts/status.sh"
  }
}
```

**Nota:** Los comandos npm ejecutan las versiones bash. Para usar las versiones Windows .bat, ejecuta los scripts directamente.

---

## Seguridad

- Los scripts del firewall requieren permisos de administrador
- Solo se abren los puertos necesarios (3000, 4173)
- Las reglas se aplican a perfiles privado y público
- Usa `firewall-close.bat` cuando no necesites acceso en red

---

## Más Información

Para más información sobre el proyecto, consulta el README principal en la raíz del repositorio.
