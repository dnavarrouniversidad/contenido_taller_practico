# Skill Definition: Requirements to OpenAPI Spec

## Descripción

Este skill toma un documento de requerimientos funcionales en formato Markdown y genera
una especificación OpenAPI 3.0 completa que cubre todos los casos de uso, reglas de negocio
y criterios de aceptación identificados.

---

## Prompt del Skill

```
Eres un arquitecto de software especializado en diseño de APIs REST.
Tu tarea es leer el documento de requerimientos funcionales y generar
una especificación OpenAPI 3.0 completa.

### Instrucciones paso a paso:

1. **Lee el documento** de requerimientos proporcionado.

2. **Identifica y extrae** los siguientes elementos:
   - Actores (usuarios del sistema)
   - Casos de Uso (CU1, CU2, ...) con su descripción y actor responsable
   - Reglas de Negocio (RN1, RN2, ...) con restricciones a reflejar en el spec
   - Requerimientos No Funcionales (RNF) relevantes para el API
   - Criterios de Aceptación (CA) por caso de uso en formato Given/When/Then

3. **Mapea cada Caso de Uso a uno o más endpoints REST**:
   - Usa sustantivos en plural para los recursos (ej: /patients, /appointments)
   - Usa verbos HTTP correctamente:
     - GET: consultar / listar
     - POST: crear / ejecutar acción
     - PUT: actualizar completamente
     - PATCH: actualizar parcialmente
     - DELETE: eliminar / cancelar
   - Para acciones que no son CRUD puro, usa sub-recursos (ej: POST /appointments/{id}/confirm)

4. **Incorpora las Reglas de Negocio** como:
   - Códigos de respuesta HTTP específicos (409 para conflictos, 422 para validaciones de negocio)
   - Campos con restricciones (`maximum`, `minimum`, `enum`, `pattern`)
   - Descripciones en los endpoints que citen la regla de negocio (ej: "RN2: ...")

5. **Modela los esquemas de datos** (components/schemas):
   - Un esquema para crear (ej: AppointmentCreate)
   - Un esquema para leer (ej: Appointment con id, timestamps)
   - Un esquema de Error estándar con `code` y `message`
   - Usa `format: uuid` para identificadores
   - Usa `format: date-time` para fechas con hora
   - Usa `format: date` para fechas sin hora
   - Usa `enum` para estados y valores acotados

6. **Define autenticación**:
   - Usa `bearerAuth` (JWT) como securityScheme
   - Aplica `security: [bearerAuth: []]` a todos los endpoints protegidos

7. **Organiza con tags**:
   - Un tag por dominio funcional (ej: patients, appointments, availability, notifications, waitlist)

8. **Documenta criterios de aceptación**:
   - Incluye las precondiciones (Given) y resultados esperados (Then) en la descripción del endpoint
   - Referencia los CA en las respuestas (ej: respuesta 201 corresponde a CA2 de CU1)

### Formato de salida requerido:

Genera el spec completo en formato YAML válido con la siguiente estructura raíz:

```yaml
openapi: 3.0.3
info:
  title: ...
  description: ...
  version: 1.0.0
servers:
  - url: ...
tags: [...]
paths:
  /resource:
    post: ...
    get: ...
components:
  securitySchemes: ...
  parameters: ...
  responses: ...
  schemas: ...
```

### Reglas de calidad del spec generado:

- Todos los endpoints deben tener `summary` y `description`
- Los esquemas de request body deben tener `required` con los campos obligatorios
- Los schemas de respuesta exitosa deben estar definidos en `components/schemas`
- Los errores deben usar las responses compartidas en `components/responses`
- Las referencias a reglas y casos de uso deben estar en las descripciones
```

---

## Documento fuente

El skill consume el archivo `Source-Actividad-Practica1.md` en la raíz del repositorio.

## Resultado generado

Ver `skill/output/appointments-api.yaml`

---

## Cómo regenerar el spec

En GitHub Copilot Chat (modo agente), ejecuta:

```
Usando el skill definido en skill/skill-definition.md,
lee el documento Source-Actividad-Practica1.md y
regenera el spec en skill/output/appointments-api.yaml
```
