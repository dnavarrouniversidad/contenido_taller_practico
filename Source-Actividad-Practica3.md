# Planificación de Proyecto de Software - Sistema de Gestión Clínica y Agendamiento de Pacientes

## 1. Objetivos

### 1.1 Objetivos Generales

Diseñar e implementar un sistema de gestión clínica y agendamiento para un centro de salud ambulatorio que permita administrar pacientes, citas médicas y fichas clínicas, reduciendo errores operacionales, mejorando la trazabilidad y asegurando la protección de la información sensible.

### 1.2 Objetivos Específicos

- Digitalizar el proceso de agendamiento actualmente realizado de forma manual.
- Centralizar la gestión de pacientes y profesionales tratantes.
- Implementar mecanismos de autenticación y autorización basados en roles.
- Garantizar trazabilidad y auditoría de acciones clínicas y administrativas.
- Permitir la gestión de disponibilidad de tratantes.
- Implementar recordatorios y notificaciones automáticas.
- Mejorar la experiencia de pacientes y personal administrativo.
- Asegurar cumplimiento de principios básicos de privacidad y confidencialidad de ficha clínica.

---

# 2. Alcance del Proyecto

El proyecto considera el diseño, desarrollo e implementación de un sistema web para gestión clínica y administración ambulatoria.

El sistema permitirá gestionar:
- pacientes,
- tratantes,
- agenda médica,
- confirmaciones,
- reprogramaciones,
- disponibilidad,
- trazabilidad,
- acceso a fichas clínicas.

El proyecto no considera:
- integración con sistemas hospitalarios complejos,
- interoperabilidad HL7/FHIR avanzada,
- telemedicina en tiempo real,
- facturación avanzada,
- inteligencia artificial clínica.

## 2.1 Requerimientos Funcionales

### Gestión de Agenda
- Solicitar hora médica.
- Confirmar cita.
- Reprogramar cita.
- Cancelar cita.
- Gestionar lista de espera.

### Gestión de Pacientes
- Registrar pacientes.
- Mantener ficha clínica.
- Consultar historial de atenciones.

### Gestión de Tratantes
- Configurar disponibilidad.
- Visualizar agenda.
- Configurar modalidad de atención.

### Automatizaciones
- Envío de recordatorios automáticos.
- Registro de auditoría.
- Gestión de estados de cita.

---

## 2.2 Requerimientos No Funcionales

### Seguridad
- Autenticación y autorización.
- Restricción de acceso a fichas clínicas.
- Auditoría de accesos y modificaciones.

### Disponibilidad
- Disponibilidad superior al 99,5% en horario laboral.

### Rendimiento
- Tiempo de respuesta menor a 100 ms en operaciones estándar.

### Usabilidad
- Flujo simple de agendamiento.
- Mensajes de error claros.
- Indicadores visuales para procesos largos.

### Trazabilidad
- Registro de acciones críticas:
  - acceso a ficha,
  - modificaciones,
  - confirmaciones,
  - cancelaciones,
  - cambios de agenda.

---

## 2.3 Resultado MoSCoW (Entra en Scope)

### Must Have
- Registro de pacientes.
- Gestión de agenda.
- Confirmación y reprogramación de citas.
- Gestión de disponibilidad de tratantes.
- Autenticación y autorización.
- Auditoría.
- Restricción de acceso a ficha clínica.

### Should Have
- Notificaciones automáticas.
- Gestión de no-show.
- Reportes operacionales básicos.

### Could Have
- Lista de espera automática.
- Integración con Google Calendar.
- Dashboard administrativo.

### Will Not Have
- Telemedicina.
- Facturación avanzada.
- Integraciones hospitalarias complejas.
- Inteligencia artificial clínica.

---

## 2.4 Diseño de Arquitectura de Alto Nivel

Se propone una arquitectura en capas debido a:
- dominio acotado,
- alta cohesión funcional,
- fuerte necesidad de consistencia transaccional,
- equipo de desarrollo pequeño,
- complejidad moderada del sistema.

### Capas propuestas

#### Capa de Presentación
- Portal web.
- Interfaces para pacientes, recepción y tratantes.

#### Capa de Aplicación
- Controllers MVC.
- REST APIs.
- Orquestación de casos de uso.

#### Capa de Negocio
- Gestión de citas.
- Gestión de pacientes.
- Gestión de fichas clínicas.
- Reglas de negocio.
- Autorización.

#### Capa de Datos
- Persistencia relacional.
- Auditoría.
- Logs.

#### Integraciones Externas
- Google Calendar.
- Servicios de correo y notificaciones.

---

# 3. Identificación de Stakeholders

## Matriz de Identificación de Stakeholders

| Stakeholder | Influencia | Interés | Estrategia |
|---|---|---|---|
| Patrocinador del proyecto | Alta | Alta | Comité de seguimiento y reportes ejecutivos |
| Dirección clínica | Alta | Alta | Validación continua de requerimientos clínicos |
| Recepcionistas | Media | Alta | Levantamiento frecuente de feedback |
| Tratantes | Media | Alta | Validación de flujos clínicos y agenda |
| Pacientes | Baja | Alta | Evaluación de experiencia usuaria |
| Equipo TI | Alta | Media | Coordinación técnica permanente |
| Seguridad informática | Media | Alta | Revisión de controles de seguridad |
| Operaciones | Media | Media | Coordinación de despliegue y soporte |

---

# 4. WBS y Cronograma Simplificado

## Tipo de Proyecto

Proyecto de transformación operativa y digitalización clínica.

---

## Cronograma Tipo

### 1. Inicio
- Elaborar acta de constitución.
- Identificar stakeholders.
- Validar alcance inicial.

### 2. Planificación
- Levantamiento detallado de requerimientos.
- Validación de reglas clínicas.
- Diseño de arquitectura.
- Diseño de seguridad y permisos.

### 3. Ejecución y Construcción
- Desarrollo de autenticación y autorización.
- Desarrollo de gestión de pacientes.
- Desarrollo de agenda médica.
- Desarrollo de ficha clínica.
- Desarrollo de auditoría.
- Desarrollo de notificaciones.
- Pruebas funcionales e integración.

### 4. Validación Clínica
- Validación con usuarios clave.
- Ajustes funcionales.
- Capacitación.

### 5. Cierre y Transición
- Despliegue productivo.
- Soporte inicial.
- Cierre administrativo.

---

## Cronograma Simplificado

| Fase | Duración |
|---|---|
| Inicio | 2 semanas |
| Planificación | 3 semanas |
| Construcción | 12 semanas |
| Validación Clínica | 2 semanas |
| Cierre y Transición | 2 semanas |

---

# 5. Asignación de Roles y Recursos

## Roles Principales

| Rol | Responsabilidad |
|---|---|
| Project Manager | Gestión global del proyecto |
| Arquitecto de Software | Diseño técnico y NFR |
| Software Developer | Desarrollo backend/frontend |
| UX/UI | Experiencia usuaria |
| QA | Validación funcional |
| Líder Clínico | Validación funcional clínica |
| Seguridad Informática | Revisión de controles de seguridad |

---

## Recursos

### Equipo Base
- 2 Software Developers.
- 1 Project Manager.
- 1 UX/UI.
- 1 QA parcial.

### Dependencias
- Infraestructura.
- Seguridad.
- Operaciones.
- Soporte TI.

### Gastos
- Infraestructura cloud.
- Licencias.
- Servicios de correo.
- Certificados SSL.
- Pentesting externo.
- Monitoreo y logging.

---

# 6. Matriz de Riesgos

| Riesgo | Impacto | Probabilidad | Mitigación | Responsable |
|---|---|---|---|---|
| Cambios frecuentes en requerimientos clínicos | Alto | Alta | Enfoque ágil e iterativo | PM |
| Acceso indebido a ficha clínica | Alto | Media | Roles, permisos y auditoría | Seguridad |
| Problemas de disponibilidad del sistema | Alto | Media | Monitoreo y redundancia | Infraestructura |
| Resistencia al cambio de usuarios | Media | Alta | Capacitación y acompañamiento | PM |
| Retrasos por validaciones clínicas | Media | Media | Validaciones periódicas tempranas | Líder Clínico |
| Errores de agenda y doble reserva | Alto | Media | Validaciones transaccionales | Arquitecto |

---

# 7. Selección de Metodología de Desarrollo

Se propone un enfoque híbrido PMI + Scrum.

## Justificación

### PMI
Permite:
- gobernanza,
- planificación formal,
- control presupuestario,
- gestión de riesgos,
- seguimiento ejecutivo.

### Scrum
Permite:
- iteraciones cortas,
- validación continua,
- adaptación a cambios clínicos,
- feedback frecuente de usuarios.

## Estrategia de trabajo

- Sprint de 2 semanas.
- Product Backlog priorizado.
- Validaciones funcionales continuas.
- Comité de seguimiento mensual.

---

# 8. Plan de Comunicación

## Estrategia

| Actividad | Participantes | Frecuencia |
|---|---|---|
| Kickoff | Sponsor, PM, equipo | Inicio |
| Daily Scrum | Equipo técnico | Diario |
| Sprint Planning | Equipo + Product Owner | Cada Sprint |
| Sprint Review | Usuarios clave | Cada Sprint |
| Comité ejecutivo | Sponsor + PM | Mensual |
| Reporte de avance | PM → Dirección | Quincenal |
| Canal colaborativo | Equipo completo | Permanente |

---

# 9. Cierre de Proyecto y Transición

## Entregables Finales

- Sistema operativo en producción.
- Gestión clínica y agenda implementadas.
- Manual técnico.
- Manual usuario.
- Configuración de seguridad.
- Documentación de arquitectura.
- Plan de soporte.

---

## Criterios de Aceptación

- Gestión completa de agenda operativa.
- Restricción correcta de accesos.
- Auditoría funcional.
- Validación clínica aprobada.
- Cumplimiento de requerimientos críticos.
- Capacitación realizada.

---

## Actividades de Transición

- Capacitación a usuarios.
- Soporte intensivo post salida.
- Monitoreo inicial.
- Corrección de incidentes tempranos.

---

## Lecciones Aprendidas Esperadas

- La participación temprana de usuarios clínicos reduce reprocesos.
- La validación iterativa mejora adopción.
- La seguridad debe diseñarse desde el inicio.
- La trazabilidad es crítica en sistemas clínicos.
