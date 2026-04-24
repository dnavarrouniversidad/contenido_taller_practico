# Skill: Requirements to OpenAPI Spec

Este skill interpreta requerimientos funcionales escritos en lenguaje natural (formato Markdown)
y los convierte en una especificación OpenAPI 3.0 (openspec).

## ¿Qué hace este skill?

1. **Lee** el documento de requerimientos (`Source-Actividad-Practica1.md`)
2. **Identifica** actores, casos de uso, reglas de negocio y criterios de aceptación
3. **Genera** una especificación OpenAPI 3.0 (`skill/output/appointments-api.yaml`)

## Archivos

| Archivo | Descripción |
|---|---|
| `skill-definition.md` | Prompt e instrucciones para que un agente IA ejecute el skill |
| `output/appointments-api.yaml` | Especificación OpenAPI 3.0 generada desde los requerimientos |

## Uso con GitHub Copilot

Puedes usar el prompt en `skill-definition.md` directamente en GitHub Copilot Chat (modo agente)
para regenerar o actualizar el spec cuando el documento de requerimientos cambie.

## Input esperado

El skill consume documentos de requerimientos con la siguiente estructura:
- Sección de **Actores / Usuarios**
- Sección de **Casos de Uso** (formato `CU1: Descripción`)
- Sección de **Reglas de Negocio** (formato `RN1: Descripción`)
- Sección de **Requerimientos No Funcionales** (formato `RNF1: Descripción`)
- Sección de **Criterios de Aceptación** (formato Given / When / Then)

## Output generado

Un archivo YAML que cumple con el estándar [OpenAPI 3.0.3](https://swagger.io/specification/)
con endpoints que cubren todos los casos de uso identificados.

## Verificación con MCP

Una vez generado el spec, usa el MCP incluido en `../mcp/` para:
- Validar el spec contra el estándar OpenAPI
- Verificar cobertura de casos de uso
- Listar criterios de aceptación
