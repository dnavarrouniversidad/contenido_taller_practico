# Skill: Requirements to OpenSpec

Este skill interpreta requerimientos funcionales escritos en lenguaje natural (formato Markdown)
y los convierte en especificaciones **[OpenSpec](https://openspec.dev)** (`@fission-ai/openspec`),
organizadas por dominio funcional en `openspec/specs/`.

## ¿Qué hace este skill?

1. **Lee** el documento de requerimientos (`Source-Actividad-Practica1.md`)
2. **Identifica** actores, casos de uso, reglas de negocio y criterios de aceptación
3. **Genera** archivos `spec.md` en formato OpenSpec por dominio en `openspec/specs/`

## Archivos

| Archivo | Descripción |
|---|---|
| `skill-definition.md` | Prompt e instrucciones para que un agente IA ejecute el skill |

## Specs generados

Los specs viven en `openspec/specs/` (formato OpenSpec):

| Dominio | Casos de uso cubiertos |
|---|---|
| `auth/spec.md` | RNF1 (autenticación/autorización), RNF2 (auditoría) |
| `patients/spec.md` | CU6, RN3, RN5, RN6 |
| `appointments/spec.md` | CU1, CU2, CU3, CU4, CU7, CU8, RN1, RN2, RN4 |
| `availability/spec.md` | CU10, CU11, CU12 |
| `notifications/spec.md` | CU5, CU13, CU14 |
| `waitlist/spec.md` | CU9 |

## Uso con GitHub Copilot

Puedes usar el prompt en `skill-definition.md` directamente en GitHub Copilot Chat (modo agente)
para regenerar o actualizar los specs cuando el documento de requerimientos cambie.

Los slash commands de OpenSpec también están disponibles en `.github/prompts/`:
- `/opsx:propose` — crear nuevo cambio con todos los artifacts
- `/opsx:apply` — implementar las tareas del cambio
- `/opsx:archive` — archivar un cambio completado

## Input esperado

El skill consume documentos de requerimientos con la siguiente estructura:
- Sección de **Actores / Usuarios**
- Sección de **Casos de Uso** (formato `CU1: Descripción`)
- Sección de **Reglas de Negocio** (formato `RN1: Descripción`)
- Sección de **Requerimientos No Funcionales** (formato `RNF1: Descripción`)
- Sección de **Criterios de Aceptación** (formato Given / When / Then)

## Output generado

Archivos `spec.md` en formato OpenSpec con la estructura:
```
# <Domain> Specification
## Purpose
## Requirements
### Requirement: <Name>
The system MUST/SHALL/SHOULD <behavior>
#### Scenario: <Name>
- GIVEN <precondition>
- WHEN <action>
- THEN <expected result>
```

## Verificación con MCP

Una vez generados los specs, usa el MCP incluido en `../mcp/` para:
- Validar que los specs cumplen el formato OpenSpec
- Listar criterios de aceptación (Given/When/Then)
- Verificar cobertura de casos de uso y reglas de negocio
