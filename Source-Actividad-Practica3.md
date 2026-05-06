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

**Explicaión:** Buscamos determinar que es lo que el proyecto incluye y qué es lo que excluye. Además definir cuáles son los aspectos técnicos iniciales que debemos considerar.


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

## 2.3 Resultado MoSCoW

**Nota:** Buscamos determinar los requerimientos prioritarios y aquellos que vamos a excluir en este alcance.

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

**Explicación:** El análisis de las partes interesadas generalmente se refiere al conjunto de técnicas o herramientas para identificar y comprender las necesidades y expectativas de los principales actores dentro y fuera del entorno del proyecto. La Matriz de análisis de Stakeholders, divide a los interesados en cuatro cuadrantes basados en dos ejes: 
* Influencia / Poder: Capacidad que tiene para afectar las decisiones y resultados del proyecto.
* Interes: Nivel de preocupación o beneficio que el resultado del proyecto tiene para este stakeholder. 

**Recurso 1 (Resumen):** [PMI - Gestión de Interesados](https://pmi-levante.org/gestion-interesados/)

**Recurso 2 (Completo):** [PMI - Análisis de las partes interesadas](https://www.pmi.org/learning/library/stakeholder-analysis-pivotal-practice-projects-8905) 


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

**Explicación:** PMI lo define como la descomposición jerárquica orientada a entregables del trabajo que debe ejecutar el equipo del proyecto. Es una herramienta útil para delimitar alcances, comunicar y planificar. 

**Tips para lograr un WBS eficaz**:

- Es una agrupación de elementos del proyecto orientada a los entregables.
- Contiene el 100% del trabajo definido por el alcance o contrato y abarca todos los entregables (internos, externos, intermedios) en términos de trabajo a completar, incluida la gestión del proyecto.
- Define el contexto del proyecto, aclara el trabajo y comunica el alcance del proyecto a todas las partes interesadas.
- Se expresa como un diagrama o esquema, proporcionando un desglose gráfico o textual.
- Debe contener al menos 2 niveles
- Utiliza sustantivos y adjetivos, no verbos.
- Evoluciona junto con la elaboración progresiva del alcance del proyecto, hasta el punto de la línea base del alcance, y posteriormente de acuerdo con el control de cambios del proyecto, lo que permite una mejora continua.


---

## WBS Simplificado Orientado a Entregables de 3 Niveles

### 1. Gestión del Proyecto
- 1.1 Acta de constitución
- 1.2 Planificación del proyecto
- 1.3 Gestión de riesgos
- 1.4 Gestión de stakeholders
- 1.5 Seguimiento y control

### 2. Análisis y Diseño
- 2.1 Levantamiento de requerimientos
- 2.2 Validación de procesos clínicos
- 2.3 Diseño de arquitectura
- 2.4 Diseño de seguridad y permisos
- 2.5 Diseño de base de datos

### 3. Plataforma de Gestión Clínica

#### 3.1 Gestión de Pacientes
- 3.1.1 Registro de pacientes
- 3.1.2 Administración de ficha clínica
- 3.1.3 Historial de atenciones

#### 3.2 Gestión de Agenda
- 3.2.1 Agendamiento de citas
- 3.2.2 Confirmación y reprogramación
- 3.2.3 Gestión de disponibilidad
- 3.2.4 Gestión de no-show

#### 3.3 Seguridad y Auditoría
- 3.3.1 Autenticación y autorización
- 3.3.2 Control de acceso
- 3.3.3 Auditoría de acciones

#### 3.4 Notificaciones
- 3.4.1 Recordatorios automáticos
- 3.4.2 Integración correo electrónico
- 3.4.3 Integración Google Calendar

### 4. Calidad y Validación
- 4.1 Pruebas funcionales
- 4.2 Validación clínica
- 4.3 Corrección de incidencias

### 5. Despliegue y Transición
- 5.1 Configuración productiva
- 5.2 Capacitación de usuarios
- 5.3 Soporte inicial
- 5.4 Cierre del proyecto

---

## Cronograma Simplificado

| Fase | Duración |
|---|---|
| Inicio y planificación | 2 semanas |
| Análisis y diseño | 3 semanas |
| Construcción plataforma clínica | 10 semanas |
| Validación y pruebas | 2 semanas |
| Despliegue y transición | 2 semanas |

---

### Complemento: Product Roadmap

Como complemento al WBS, el Product Roadmap permite generar una perspectiva estratégica del proyecto. En el siguiente enlace está una explicación detallada de este tema. [Link a detalle de product roadmap](https://agilealliance.org/all-you-need-to-know-about-product-roadmaps-a-hands-on-guide/)

# 5. Asignación de Roles y Recursos

**Explicación**: Buscamos determinar los roles que son necesarios para el proyecto, los gastos asociados y las dependencias con terceros u otros equipos. Algunas definiciones: 

* **Posicion:** Generalmente se define en la descripción del puesto dentro de una organización, que detalla lo que se espera de la persona que lo desempeñará, así como sus habilidades y aptitudes.
* **Rol:** Dentro de cada posición, existe al menos un rol que desempeñar.  En la gestión de proyectos y programas, a menudo hay varios roles asociados a cada puesto, según las necesidades y la fase del ciclo de vida del mismo. Los roles típicos en la gestión de programas son director de programa, coordinador de planificación, usuario sénior, etc.
* **Responsabilidad:** Cada rol que se asume conlleva un conjunto de responsabilidades. Sin embargo, no es necesario cumplir con todas las responsabilidades en cada ocasión. Las responsabilidades requeridas varían según el tipo de iniciativa y la etapa del ciclo de vida del programa. Algunos ejemplos de responsabilidades son el control de calidad, la elaboración de informes de gestión y la planificación de riesgos
* **Habilidad:** Para desempeñar satisfactoriamente una responsabilidad, se requiere una habilidad o un conjunto de habilidades. Estas habilidades suelen adquirirse mediante formación, experiencia o una combinación de ambas. Algunos ejemplos de habilidades son: comunicación, planificación y liderazgo.

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

**Explicación:** Un riesgo en proyectos es un evento o condición incierta que, en caso de que ocurra, tiene un efecto positivo o negativo sobre al menos un objetivo del proyecto, llámese tiempo, costo, alcance o calidad (PMBOK). 

**Referencia:** Ver Elementos básicos de un plan ligero (lean) de riesgos - [PMI Risk Management](https://www.pmi.org/learning/library/es-desmitificando-el-enfoque-practico-de-la-planificacion-de-riesgos-7331) 

**Herramienta:** En el mismo repositorio, se encuentra el archivo Ejemplo_Matriz_Riesgos.xlsx que ayuda en la generación de una matriz con nueve grados de criticidad. 

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

**Explicación**: Buscamos justificar la selección de la metodología de desarrollo para el proyecto. Es útil considerar aspectos cómo:

- Variabilidad de requerimientos / probabilidad de cambio de requerimientos / tolerancia a cambios (Alta = Agil)
- Lineamientos de la organización respecto de la asignación de recursos. Ejemplo: Empresas que no permiten enfoque DevOps, esto significa que no puedes contar al 100% con la capacidad de operar tu producto de punta a punta, por lo tanto es altamente probable que existan dificultades para capturar el beneficio de la agilidad, principalmente al existir dependencias que afecten el ritmo de entrega del equipo. 
- Cantidad de recursos / presupuesto disponibles. 
- Directriz de la organización sobre metodologías de ejecución de proyectos de software


## Propuesta metodológica
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

**Explicación**: Establecer los mecanismos / canales de comunicación para lograr que el cambio (proyecto) se logre en la organización (Change Management).

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

**Explicación:** Determinar los entregables finales y la medición de los resultados obtenidos. 

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


## Métricas organizacionales impactadas

### Digitalización y eficiencia operacional

- % reducción de errores de agendamiento manual **(métrica clave)**

- % reducción de tiempo promedio de creación de cita

- % reducción de uso de planillas o registros manuales

- Tiempo promedio de búsqueda de información de pacientes

### Gestión clínica y coordinación

- % de disponibilidad visible de agenda de tratantes

- % reducción de dobles reservas **(métrica clave)**

- % reducción de conflictos de agenda

- Tiempo promedio de reprogramación de citas

### Experiencia de usuario

- Nivel de satisfacción de pacientes **(métrica clave)**

- Nivel de satisfacción de personal administrativo

- % reducción de reclamos asociados a agendamiento

- Tiempo promedio de atención en recepción

### Automatización y cumplimiento de citas

- % de citas confirmadas automáticamente

- % reducción de no-show **(métrica clave)**

- % de recordatorios enviados exitosamente

- Tasa de respuesta a notificaciones

### Seguridad y cumplimiento

- % de accesos auditados correctamente

- Número de incidentes de acceso no autorizado

- % cumplimiento de políticas de acceso por rol (**métrica clave**)

- Tiempo promedio de trazabilidad de acciones clínicas

### Calidad operativa

- Disponibilidad mensual del sistema (% uptime)

- Tiempo promedio de respuesta del sistema

- Número de incidentes críticos operacionales

- % de incidencias resueltas dentro de SLA **(métrica clave)**