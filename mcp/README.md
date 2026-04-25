# MCP: Spec Runner

Model Context Protocol (MCP) server que permite a un agente IA cargar, analizar, validar y
verificar especificaciones a partir de documentos de requerimientos en cualquier formato Markdown.

El MCP es el backend del **asistente de elaboración de especificaciones**: detecta gaps y
ambigüedades en cualquier documento de requerimientos y genera preguntas de clarificación
específicas antes de generar las especificaciones OpenSpec.

## Herramientas expuestas

| Herramienta | Descripción |
|---|---|
| `load_requirements` | Lee y retorna el contenido de un documento de requerimientos Markdown |
| `detect_gaps` | Detecta gaps en el documento: preguntas sin respuesta, requerimientos sin criterios de aceptación, términos ambiguos, marcadores TBD/TODO, secciones faltantes |
| `suggest_clarifications` | Genera preguntas de clarificación específicas y accionables para cada gap detectado |
| `validate_openspec` | Valida que un `spec.md` (o todos los de `openspec/specs/`) cumplan el formato OpenSpec |
| `list_acceptance_criteria` | Extrae y lista todos los escenarios GIVEN/WHEN/THEN de un documento o spec.md |
| `verify_spec_coverage` | Verifica que los specs cubran todos los requerimientos del documento (soporta cualquier nomenclatura: CU, US, REQ, FR, etc.) |

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

## Flujo de trabajo recomendado

```
1. load_requirements       → cargar el documento
2. detect_gaps             → ver qué falta o es ambiguo
3. suggest_clarifications  → obtener preguntas para completar
4. [humano responde y completa el documento]
5. validate_openspec       → validar los specs generados
6. verify_spec_coverage    → verificar cobertura completa
7. list_acceptance_criteria → revisar criterios de aceptación
```

## Ejemplos de uso con el agente

Una vez conectado el MCP, puedes pedirle al agente IA:

```
Detecta los gaps en Source-Actividad-Practica1.md
```

```
¿Qué preguntas de clarificación tiene el documento Source-Actividad-Practica2.md?
```

```
Valida todos los specs en openspec/specs/
```

```
Verifica si los specs en openspec/specs/ cubren todos los
requerimientos del documento Source-Actividad-Practica1.md
```

## Herramientas en detalle

### `load_requirements`

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:** Contenido completo del archivo Markdown.

---

### `detect_gaps`

Analiza un documento de requerimientos (cualquier formato) buscando:
- Preguntas en formato `**¿...?**` sin respuesta
- Marcadores de pendiente: TBD, TODO, por definir, pendiente
- Requerimientos funcionales (CU, US, FR, REQ, etc.) sin escenarios Given/When/Then
- Términos ambiguos o vagos (algunos, rápido, adecuado, etc.)
- Secciones estándar ausentes (Actores, Casos de Uso, Reglas de Negocio, NFRs, Criterios de Aceptación)

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:**
```
🔎 Análisis de gaps — Source-Actividad-Practica1.md
   Problemas detectados: 5

❓ Preguntas sin respuesta (1):
   • Línea 35: **¿Aparte del recepcionista, quién más interactúa con el sistema?...

🎯 Requerimientos sin criterios de aceptación (8):
   • CU3: Reprogramar hora
   • CU4: Asistir a hora
   ...

🔍 Términos ambiguos detectados (3 ocurrencias):
   • "varios" en línea 28: ¿Qué especialidades existen? Varias.
   ...
```

---

### `suggest_clarifications`

Genera preguntas de clarificación específicas y accionables para cada gap detectado.

**Input:**
```json
{ "filePath": "Source-Actividad-Practica1.md" }
```
**Output:**
```
💬 Preguntas de clarificación para: Source-Actividad-Practica1.md
   8 pregunta(s) generada(s)

1. ❓ Pregunta sin respuesta (línea 35): "¿Aparte del recepcionista, quién más interactúa con el sistema?" — Por favor, proporcione una respuesta concreta.

2. 🎯 Criterios de aceptación faltantes — CU3 ("Reprogramar hora"): No se encontraron escenarios Given/When/Then. ¿Cuándo se considera correctamente implementado?...

3. 🔍 Término ambiguo — "varios" (línea 28): "¿Qué especialidades existen? Varias." — ¿Puede reemplazar este término por un valor concreto, rango o condición medible?
...
```

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
...
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

---

### `verify_spec_coverage`

Verifica cobertura para **cualquier nomenclatura de requerimientos** (CU, US, REQ, FR, RN, etc.).
Categoriza automáticamente: requerimientos funcionales, reglas de negocio y NFRs.

**Input:**
```json
{
  "specsDir": "openspec/specs",
  "requirementsPath": "Source-Actividad-Practica1.md"
}
```
**Output:**
```
📋 Requerimientos funcionales encontrados: 14
✅ Cubiertos por los specs: 14
❌ Sin cobertura detectada: 0

── Requerimientos funcionales ──────────────────────
✅ CU1: Solicitar o agendar hora
✅ CU2: Confirmar hora
...

📌 Reglas de negocio: 6
✅ RN1: Una cita solo puede estar en un estado a la vez
...

⚙️  Requerimientos no funcionales: 7
✅ RNF1: Autenticación y autorización
...

📂 Spec files analizados: 6
  openspec/specs/auth/spec.md
  ...
```

