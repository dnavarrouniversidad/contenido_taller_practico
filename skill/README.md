# Skill: Asistente de Elaboración de Especificaciones

Este skill actúa como un **asistente de elaboración de especificaciones**. Interpreta cualquier
documento de requerimientos en formato Markdown (independientemente de su estructura o nomenclatura)
y realiza tres funciones principales:

1. **Detecta gaps y ambigüedades** en el documento (preguntas sin respuesta, términos vagos,
   requerimientos sin criterios de aceptación, secciones faltantes)
2. **Genera preguntas de clarificación** específicas y accionables para completar la especificación
3. **Genera especificaciones** en formato **[OpenSpec](https://openspec.dev)** organizadas por
   dominio funcional en `openspec/specs/`

## ¿Qué hace este skill?

1. **Lee** cualquier documento de requerimientos en Markdown
2. **Analiza** su estructura: detecta qué nomenclatura usa (CU/RN, US/FR, REQ-xxx, etc.)
   y qué secciones estándar están presentes o ausentes
3. **Detecta gaps**: preguntas sin respuesta, TBD/pendientes, términos ambiguos,
   requerimientos sin criterios de aceptación, actores sin casos de uso
4. **Ayuda al humano** formulando preguntas específicas para completar cada gap
5. **Genera** archivos `spec.md` en formato OpenSpec por dominio funcional

## Archivos

| Archivo | Descripción |
|---|---|
| `skill-definition.md` | Prompt e instrucciones para que un agente IA ejecute el skill |

## Documentos fuente compatibles

El skill acepta cualquier documento de requerimientos en Markdown, incluyendo:

- Documentos de análisis con Actores, Casos de Uso (CU), Reglas de Negocio (RN) y NFRs
- Documentos de diseño con decisiones arquitectónicas y NFRs detallados
- Historias de usuario (US, HU), especificaciones funcionales (FR, REQ-xxx)
- Cualquier otro documento de requerimientos en Markdown

## Uso con GitHub Copilot

```
Usando el skill definido en skill/skill-definition.md,
lee el documento <ruta-al-documento>.md y
actúa como asistente de elaboración de especificaciones.
```

Los slash commands de OpenSpec también están disponibles en `.github/prompts/`:
- `/opsx:propose` — crear nuevo cambio con todos los artifacts
- `/opsx:apply` — implementar las tareas del cambio
- `/opsx:archive` — archivar un cambio completado

## Flujo de trabajo del skill

```
Documento de requerimientos
         │
         ▼
   Fase 0: Análisis
   (detecta estructura y nomenclatura)
         │
         ▼
   Fase 1: Gaps y ambigüedades
   (preguntas sin respuesta, TBD, términos vagos,
    requerimientos sin criterios, secciones faltantes)
         │
         ▼
   Fase 2: Clarificación
   (formula preguntas específicas, espera respuestas
    o documenta asunciones)
         │
         ▼
   Fase 3: Generación OpenSpec
   (spec.md por dominio + proposal/design/tasks)
```

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
- Detectar gaps en el documento de requerimientos (`detect_gaps`)
- Obtener preguntas de clarificación (`suggest_clarifications`)
- Validar que los specs cumplen el formato OpenSpec (`validate_openspec`)
- Listar criterios de aceptación (`list_acceptance_criteria`)
- Verificar cobertura de requerimientos (`verify_spec_coverage`)

