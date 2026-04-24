# MCP: Spec Runner

Model Context Protocol (MCP) server que permite a un agente IA cargar, validar y verificar
especificaciones OpenAPI generadas a partir de requerimientos funcionales.

## Herramientas expuestas

| Herramienta | Descripción |
|---|---|
| `load_requirements` | Lee y retorna el contenido de un documento de requerimientos Markdown |
| `validate_openapi_spec` | Valida un spec OpenAPI 3.x contra el estándar (YAML o JSON) |
| `list_acceptance_criteria` | Extrae y lista todos los criterios de aceptación Given/When/Then del documento de requerimientos |
| `verify_spec_coverage` | Verifica que el spec OpenAPI cubra todos los casos de uso (CU) y reglas de negocio (RN) del documento de requerimientos |

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

### Ejemplo con Claude Desktop

En `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "spec-runner": {
      "command": "node",
      "args": ["/ruta/al/repositorio/mcp/src/index.js"]
    }
  }
}
```

### Ejemplo con GitHub Copilot (VS Code)

En `.vscode/mcp.json` dentro del workspace:

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
Valida el spec en skill/output/appointments-api.yaml
```

```
Lista los criterios de aceptación de Source-Actividad-Practica1.md
```

```
Verifica si el spec skill/output/appointments-api.yaml cubre todos los
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

### `validate_openapi_spec`

**Input:**
```json
{ "specPath": "skill/output/appointments-api.yaml" }
```
**Output (éxito):**
```
✅ Spec válida: Sistema de Gestión de Citas v1.0.0
   OpenAPI: 3.0.3
   Endpoints (paths): 18
   Schemas: 15
   Tags: auth, patients, appointments, availability, notifications, waitlist
```
**Output (error):**
```
❌ Spec inválida:
Semantic error at paths./patients.post.responses.201: ...
```

---

### `list_acceptance_criteria`

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:**
```
CU1: Solicitar o agendar hora (Must):
    CA1:
      Given: que el recepcionista selecciona un profesional y una fecha
      When:  intenta elegir una franja horaria ya reservada
      Then:  el sistema debe bloquear la selección e indicar que la hora no está disponible
    CA2:
      Given: que existe una hora disponible seleccionada
      ...
```

---

### `verify_spec_coverage`

**Input:**
```json
{
  "specPath": "skill/output/appointments-api.yaml",
  "requirementsPath": "Source-Actividad-Practica1.md"
}
```
**Output:**
```
📋 Casos de uso en requerimientos: 14
✅ Cubiertos por el spec: 14
❌ Sin cobertura detectada: 0

── Detalle ───────────────────────
✅ CU1: Solicitar o agendar hora
✅ CU2: Confirmar hora
...

📌 Reglas de negocio encontradas: 6
  RN1: Una cita solo puede estar en un estado a la vez
  ...

🛣  Endpoints en el spec: 18
  /auth/login
  /auth/logout
  ...
```
