# Skill Definition: Requirements to OpenSpec

## Descripción

Este skill toma un documento de requerimientos funcionales en formato Markdown y genera
especificaciones en formato **[OpenSpec](https://openspec.dev)** (`@fission-ai/openspec`),
organizadas por dominio funcional en la carpeta `openspec/specs/`.

---

## Prompt del Skill

```
Eres un arquitecto de software especializado en diseño de sistemas y especificación de requerimientos.
Tu tarea es leer el documento de requerimientos funcionales y generar especificaciones en formato
OpenSpec (https://openspec.dev), siguiendo la estructura de specs por dominio.

### Instrucciones paso a paso:

1. **Lee el documento** de requerimientos proporcionado.

2. **Identifica y extrae** los siguientes elementos:
   - Actores (usuarios del sistema)
   - Casos de Uso (CU1, CU2, ...) con su descripción y actor responsable
   - Reglas de Negocio (RN1, RN2, ...) con restricciones
   - Requerimientos No Funcionales (RNF) relevantes
   - Criterios de Aceptación (CA) en formato Given/When/Then por caso de uso

3. **Agrupa por dominio funcional**:
   - Crea un archivo `spec.md` por cada dominio lógico (auth, patients, appointments, availability, notifications, waitlist)
   - Cada archivo va en `openspec/specs/<domain>/spec.md`
   - Los dominios deben reflejar los agrupamientos naturales de los casos de uso

4. **Formato obligatorio de cada `spec.md`**:

   ```markdown
   # <Domain> Specification

   ## Purpose
   <Descripción de alto nivel del dominio, referencias a CU/RN/RNF que aplican>

   ## Requirements

   ### Requirement: <Nombre del requerimiento>
   The system MUST/SHALL/SHOULD <comportamiento esperado>.
   <Referencia al CU o RN que lo origina, ej: "Applies to CU1, RN2.">

   #### Scenario: <Nombre del escenario>
   - GIVEN <precondición>
   - WHEN <acción del usuario o del sistema>
   - THEN <resultado esperado>
   - AND <resultado adicional opcional>
   ```

   **Reglas de formato:**
   - `## Purpose` es obligatorio en cada spec
   - Usa `### Requirement: <nombre>` para cada requerimiento
   - Usa `#### Scenario: <nombre>` para cada escenario
   - Usa RFC 2119 keywords: **MUST** (obligatorio), **SHALL** (obligatorio con matiz formal), **SHOULD** (recomendado), **MAY** (opcional)
   - Incluye al menos un escenario por requerimiento (happy path)
   - Incluye escenarios de error o borde cuando el requerimiento lo implique
   - Referencia explícitamente los CU, RN y RNF de origen en el texto

5. **Cubre todos los casos de uso y reglas de negocio**:
   - Cada CU del documento debe mapearse a al menos un `### Requirement:`
   - Cada RN del documento debe citarse en el texto del requerimiento o scenario que lo implementa
   - Los RNF de seguridad, rendimiento y disponibilidad deben mencionarse en los dominios relevantes

6. **Crea o actualiza el cambio en OpenSpec**:
   - Crea la carpeta `openspec/changes/system-initialization/` con:
     - `proposal.md` — qué se está especificando y por qué
     - `design.md` — decisiones de arquitectura y diseño
     - `tasks.md` — lista de tareas de implementación en formato checklist

### Reglas de calidad del output:

- Cada `spec.md` debe tener `## Purpose` y al menos un `### Requirement:`
- Cada `### Requirement:` debe tener al menos un `#### Scenario:` con GIVEN/WHEN/THEN
- Los escenarios deben ser concretos y verificables (se podrían convertir en tests automatizados)
- No incluir detalles de implementación interna (nombres de clases, librerías, queries SQL)
- Las referencias a CU/RN/RNF deben estar presentes en el texto
```

---

## Documento fuente

El skill consume el archivo `Source-Actividad-Practica1.md` en la raíz del repositorio.

## Resultado generado

Los specs generados se encuentran en:

```
openspec/
├── specs/
│   ├── auth/spec.md
│   ├── patients/spec.md
│   ├── appointments/spec.md
│   ├── availability/spec.md
│   ├── notifications/spec.md
│   └── waitlist/spec.md
└── changes/
    └── system-initialization/
        ├── proposal.md
        ├── design.md
        └── tasks.md
```

---

## Cómo regenerar los specs

En GitHub Copilot Chat (modo agente), ejecuta:

```
Usando el skill definido en skill/skill-definition.md,
lee el documento Source-Actividad-Practica1.md y
regenera los specs en openspec/specs/ en formato OpenSpec.
```

O usando los slash commands de OpenSpec directamente:

```
/opsx:propose system-initialization
```
