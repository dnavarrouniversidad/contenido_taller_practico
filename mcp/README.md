# MCP: Spec Runner

Model Context Protocol (MCP) server que permite a un agente IA cargar, validar y verificar
especificaciones **[OpenSpec](https://openspec.dev)** generadas a partir de requerimientos funcionales.

## Herramientas expuestas

| Herramienta | Descripción |
|---|---|
| `load_requirements` | Lee y retorna el contenido de un documento de requerimientos Markdown |
| `validate_openspec` | Valida que un `spec.md` (o todos los de `openspec/specs/`) cumplan el formato OpenSpec (Purpose + Requirements + Scenarios con GIVEN/WHEN/THEN) |
| `list_acceptance_criteria` | Extrae y lista todos los escenarios GIVEN/WHEN/THEN de un documento de requerimientos o de un spec.md |
| `verify_spec_coverage` | Verifica que los specs en `openspec/specs/` cubran todos los casos de uso (CU) y reglas de negocio (RN) del documento de requerimientos |

## Requisitos

- Node.js >= 18

## Instalación

```bash
cd mcp
npm install
```

## Uso

El servidor MCP corre sobre **stdio** (estándar de MCP). Para conectarlo a un cliente MCP
(como GitHub Copilot, Claude Desktop, Cursor, etc.), configura el cliente con:

```json
{
  "mcpServers": {
    "spec-runner": {
      "command": "node",
      "args": ["/ruta/absoluta/al/repo/mcp/src/index.js"]
    }
  }
}
```

### Ejemplo con GitHub Copilot (VS Code)

En `.vscode/mcp.json` dentro del workspace (ya incluido):

```json
{
  "servers": {
    "spec-runner": {
      "type": "stdio",
      "command": "node",
      "args": ["${workspaceFolder}/mcp/src/index.js"]
    }
  }
}
```

## Ejemplos de uso con el agente

Una vez conectado el MCP, puedes pedirle al agente IA:

```
Valida todos los specs en openspec/specs/
```

```
Lista los criterios de aceptación de Source-Actividad-Practica1.md
```

```
Verifica si los specs en openspec/specs/ cubren todos los
casos de uso del documento Source-Actividad-Practica1.md
```

## Herramientas en detalle

### `load_requirements`

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:** Contenido completo del archivo Markdown.

---

### `validate_openspec`

Valida que los archivos `spec.md` cumplan el formato OpenSpec:
- `## Purpose` section obligatoria
- Al menos un `### Requirement:` heading
- Al menos un `#### Scenario:` con líneas `- GIVEN`, `- WHEN`, `- THEN`

**Input (directorio):**
```json
{ "specPath": "openspec/specs" }
```
**Output:**
```
📋 OpenSpec validation — 6 spec(s) checked
✅ Valid: 6   ❌ Invalid: 0

✅ openspec/specs/auth/spec.md
   Requirements: 4  Scenarios: 5
✅ openspec/specs/appointments/spec.md
   Requirements: 6  Scenarios: 12
...
```

**Input (archivo individual):**
```json
{ "specPath": "openspec/specs/appointments/spec.md" }
```

---

### `list_acceptance_criteria`

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:**
```
CU1: Solicitar o agendar hora (Must) › CA1:
      Given: que el recepcionista selecciona un profesional y una fecha
      When:  intenta elegir una franja horaria ya reservada
      Then:  el sistema debe bloquear la selección...
```

También funciona con spec.md de OpenSpec:
```json
{ "filePath": "openspec/specs/appointments/spec.md" }
```
**Output:**
```
Appointment Scheduling › Successful appointment creation:
      - GIVEN a receptionist selects a physician and an available time slot
      - WHEN the receptionist confirms the appointment
      - THEN the appointment is created in `pendiente` state
```

---

### `verify_spec_coverage`

**Input:**
```json
{
  "specsDir": "openspec/specs",
  "requirementsPath": "Source-Actividad-Practica1.md"
}
```
**Output:**
```
📋 Casos de uso en requerimientos: 14
✅ Cubiertos por los specs: 14
❌ Sin cobertura detectada: 0

── Detalle de casos de uso ─────────────────────
✅ CU1: Solicitar o agendar hora
✅ CU2: Confirmar hora
...

📌 Reglas de negocio: 6
✅ RN1: Una cita solo puede estar en un estado a la vez
...

📂 Spec files analizados: 6
  openspec/specs/auth/spec.md
  openspec/specs/appointments/spec.md
  ...
```
