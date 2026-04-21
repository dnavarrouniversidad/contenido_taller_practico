# Sistema de Gestión de Citas y Agendamiento de Pacientes

## Contexto

Sistema de gestión y administración ambulatoria para un centro de salud.  
Busca disminuir errores humanos en el agendamiento, mejorar la confirmación de citas y asegurar la trazabilidad de las acciones.

---

## A. Concepción

### Preguntas iniciales

- **¿Qué problema resuelve el sistema?**  
  **Respuesta:** Gestión y administración ambulatoria para un centro de salud. Busca disminuir errores humanos en el agendamiento, mejorar la confirmación de citas y la trazabilidad.

- **¿Quién realiza la gestión de citas? ¿Quién las agenda?**  
  **Respuesta:** Encargado de recepción (**Actor**).

- **¿Cuántos médicos hay disponibles?**  
  **Respuesta:** 20.

- **¿Cuáles son los horarios disponibles?**  
  **Respuesta:** 09:00 a 17:00, de lunes a viernes.

- **¿Qué especialidades existen?**  
  **Respuesta:** Varias.

- **Cuando te refieres a disminuir errores en agenda, ¿significa que ya tienen un sistema o lo hacen manual?**  
  **Respuesta:** Actualmente se realiza de forma manual.

- **¿Realizar algún tipo de reporte?**
    **Respuesta:** Sí, reportes de agenda diaria, mensual y anual que muestran por ejemplo no-show

- **Aparte del recepcionista, ¿quién más interactúa con el sistema? ¿Los pacientes tendrán acceso?**

### Objetivo de esta actividad

Obtener los actores, los casos de uso principales y determinar si existen restricciones o reglas de negocio importantes. Obtener una vista preliminar del alcance del sistema a desarrollar.

---

## B. Indagación

### Actividades

- Paso 1: Capturar detalles sobre las funcionalidades descritas:
    - ¿Cómo funciona el agendamiento?
    - ¿Qué datos se requieren del paciente?
    - ¿Cómo se manejan atrasos o cancelaciones en la práctica?
    - ¿Qué reglas de disponibilidad existen para tratantes?
    - ¿Qué notificaciones se deben enviar y cómo se envían?
    - ¿Necesitan reportes desde administración u otro rol además de los indicados?
    
- Paso 2: Obtener números iniciales:
  - Número de pacientes por mes
  - Número mínimo y máximo de pacientes por día
  - Número de documentos
  - Determinar cuántas fichas existen por paciente.
- Paso 3: Identificar roles o tipos de usuarios junto a su principal objetivo en el sistema: 
  - Administrador del sistema: Tiene como objetivo realizar las configuraciones funcionales y técnicas del sistema (configurar correos, usuarios, roles, parametros)
  - Recepcionista: Tiene como objetivo gestionar y coordinar atenciones médicas, manejar conflictos de agenda, solicitudes de cambios por parte de pacientes o tratantes. 
  - Tratante: Tiene como objetivo disponibilizar su agenda y concretar atenciones médicas con pacientes a través del sistema. 
  - Paciente: Tiene como objetivo solicitar y confirmar citas a través del sistema, para obtener atención por parte de un profesional tratante.
- Paso 4: Definir qué debe hacer o no hacer cada rol.
- Paso 5: Identificar sistemas externos que se integran:
  - SII
  - Google Calendar
- Paso 6: Otro aspecto que pueda ser de utilidad para entender mejor el sistema. Ejemplo: Aspectos legales.

### Objetivo de la actividad

Generar conclusiones y recomendaciones para el usuario. Obtener un alcance del software más cercano. 

### Ejemplo de recomendación

Recomendamos poner foco en el agendamiento para resolver el problema principal.  
Esto implica considerar:

- Autenticación
- Autorización (perfiles y roles)
- Trazabilidad de acciones
- Funciones de agendamiento:
  - Crear
  - Editar
  - Modificar
  - Cancelar
- Notificaciones
- Políticas de cancelación
- Gestión de no-show

---

## C. Actores / Usuarios

Enumerar y detallar cada uno.
1. Paciente
2. Tratante
3. Recepcionista
4. Administrador

---

## D. Casos de Uso

Notar como en este ejemplo, se deja afuera la necesidad de reportes. Esto se puede corregir en iteraciones futuras, sin embargo, es importante considerar que es un problema de captura de requerimientos.

### Casos de uso del paciente

- **CU1:** Solicitar o agendar hora
- **CU2:** Confirmar hora
- **CU3:** Reprogramar hora
- **CU4:** Asistir a hora *(validar si aplica online o presencial)*
- **CU5:** Recibir notificaciones

### Casos de uso del recepcionista

- **CU6:** Registrar paciente
- **CU7:** Confirmar hora
- **CU8:** Reagendar hora
- **CU9:** Gestionar lista de espera de tratantes y sobrecupos

### Casos de uso del tratante

- **CU10:** Configurar horas disponibles
- **CU11:** Configurar modalidad de atención (presencial / online)
- **CU12:** Ver agenda
- **CU13:** Recibir notificaciones de tratante

### Casos de uso automatizados del sistema

- **CU14:** Enviar recordatorios automáticos

---

## E. Reglas de Negocio

Estas reglas deben respetarse obligatoriamente, independiente del caso de uso.

- **RN1:** Una cita solo puede estar en un estado a la vez (no puede estar confirmada y cancelada simultáneamente).
- **RN2:** Un tratante no puede tener dos pacientes al mismo tiempo.
- **RN3:** Un paciente no puede registrarse como usuario dos veces en el sistema.
- **RN4:** Un paciente puede reprogramar una cita un máximo de 5 veces.
- **RN5:** La ficha de un paciente solo puede ser consultada por el médico tratante.
- **RN6:** La ficha del paciente es personal, privada y no puede ser pública.

---

## F. Requerimientos No Funcionales

Atributos que definen la calidad del sistema, los veremos en detalle en la clase de diseño de software y arquitectura. 

### Seguridad

- **RNF1:** El sistema debe proveer mecanismos de autenticación y autorización.
- **RNF2:** El sistema debe registrar auditoría de accesos y modificaciones.

### Disponibilidad

- **RNF3:** Disponibilidad: Plataforma debe estar disponible para los usuarios > 99,5% del tiempo en horario laboral.

### Rendimiento

- **RNF4:** El sistema debe responder en menos de 100 ms para operaciones estándar.

### Usabilidad

- **RNF5:** Para transacciones largas, desplegar mecanismos de información al usuario (por ejemplo, barra de progreso).
- **RNF6:** Cuando se supere el tiempo máximo de respuesta, el sistema debe desplegar un mensaje de error claro al usuario.
- **RNF7:** El paciente debe realizar como máximo 3 clicks para agendar cita
---

## G. Priorización QFD + (Método MoSCoW)

El objetivo de esta etapa es hacernos una idea de las funcionalidades que son más importantes de construir, aquellas que producen un impacto positivo en el usuario, aquellas que podríamos dejar para el futuro o simplemente dejar fuera del alcance del sistema. Para eso usaremos la técnica de QFD y Moscow (leer apuntes del curso de la clase N°4)

- Paso 1: Se debe realizar una categorización de requerimientos en tres categorías: Requerimientos Normales, Requerimientos Esperados, Requerimientos Emocionantes

- Paso 2: A cada uno de ellos, se debe aplicar el atributo (Must, Should, Could, Will not)


    - **Must Have:** No negociables
    - **Should Have:** Importantes
    - **Could Have:** Sería bueno tenerlos
    - **Will Not Have:** No priorizados por ahora


Ejemplo:

### 1. Requerimientos Normales
Declarados explícitamente por los usuarios.

- **CU1:** Solicitar o agendar hora (**Must**)
- **CU2:** Confirmar hora (**Must**)
- **CU3:** Reprogramar hora (**Must**)
- **CU6:** Registrar paciente (**Must**)
- **CU7:** Confirmar hora (**Must**)
- **CU8:** Reagendar hora (**Must**)

### 2. Requerimientos Esperados
Implícitos o asumidos.

- **CU10:** Configurar horas disponibles (**Must**)
- **CU11:** Configurar modalidad de atención (**Could**)
- **CU4:** Asistir a hora (**Should**)
- **CU12:** Ver agenda (**Must**)

### 3. Requerimientos Emocionantes
No fueron pedidos, pero agregan valor.

- **CU5:** Recibir notificaciones (**Could**)
- **CU13:** Recibir notificaciones de tratante (**Could**)
- **CU14:** Enviar recordatorios automáticos (**Could**)
- **CU9:** Gestionar lista de espera y sobrecupos (**Could**)

---

### Tabla de trazabilidad: necesidad del usuario con requerimiento

La siguiente tabla permite ejemplificar cómo una necesidad del usuario se traduce en un caso de uso, regla de negocio o capacidad del sistema, junto con su clasificación DFC y prioridad MoSCoW.

Observar cómo mediante esta tabla resumen, se refleja que una necesidad del usuario no está cubierta por el relevamiento de requerimientos "Revisar ausencias y no-show". Esto nos permite por ejemplo, realizar una corrección al levantamiento de requerimientos.

| Necesidad del usuario | Requerimiento del sistema | Tipo DFC | Prioridad (MoSCoW) |
|---|---|---|---|
| Solicitar una hora médica sin errores | **CU1** – Solicitar o agendar hora | Normal | Must |
| Confirmar asistencia fácilmente | **CU2** – Confirmar hora | Normal | Must |
| Reprogramar citas sin llamar al centro | **CU3** – Reprogramar hora | Normal | Must |
| Evitar dobles reservas | **RN2** – Validación de disponibilidad por profesional | Normal | Must |
| Configurar horarios de atención | **CU10** – Configurar horas disponibles | Esperado | Must |
| Visualizar agenda diaria del tratante | **CU12** – Ver agenda | Esperado | Must |
| Recibir recordatorios automáticos | **CU14** – Enviar recordatorios automáticos | Emocionante | Could |
| Gestionar sobrecupos y lista de espera | **CU9** – Gestión de lista de espera | Emocionante | Could |
| Revisar ausencias y no-show | **Caso de uso no definido** | No definido | No definido |


## H. Criterios de Aceptación

Sirve para determinar qué significa que un caso de uso esté debidamente implementado en el sistema. Usaremos la técnica Given When Then que sirve para definir casos de prueba [Link](https://martinfowler.com/bliki/GivenWhenThen.html)

* **Given:** precondición (situación inicial del sistema)
* **When:** Es el comportamiento que estamos especificando (lo que el usuario hace en el sistema, que nos interesa definir)
* **Then:** Describe lo que debe suceder después de la interacción, el estado en que queda el sistema después de haber sido afectado por el comportamiento del usuario. 

Ejemplos:

### CU1: Solicitar o agendar hora (**Must**)

- **CA1**
  - **Given:** que el recepcionista selecciona un profesional y una fecha
  - **When:** intenta elegir una franja horaria ya reservada
  - **Then:** el sistema debe bloquear la selección e indicar que la hora no está disponible

- **CA2**
  - **Given:** que existe una hora disponible seleccionada
  - **When:** el recepcionista guarda la cita
  - **Then:** la cita debe quedar en estado `pendiente` y programar recordatorios en T-24h y T-2h, si el canal de notificación está activo

- **CA3**
  - **Given:** que la cita fue creada exitosamente
  - **When:** se confirma el guardado
  - **Then:** la agenda del profesional debe actualizarse en tiempo real

### CU7: Confirmar hora (**Must**)

- **CA1**
  - **Given:** que existe una cita en estado `pendiente`
  - **When:** recepción realiza el check-in
  - **Then:** el sistema cambia el estado a `confirmada` y registra timestamp y usuario responsable

- **CA2**
  - **Given:** que una cita ya superó su hora programada por más de 24 horas
  - **When:** no existe registro de check-in
  - **Then:** el sistema debe sugerir marcar la cita como `no-show`

### CU14: Enviar recordatorio automático (**Could**)

- **CA1**
  - **Given:** que existe una cita futura confirmada o pendiente
  - **When:** faltan 24 horas o 2 horas para la atención
  - **Then:** el sistema genera automáticamente el evento de recordatorio correspondiente

- **CA2**
  - **Given:** que el sistema intenta enviar un recordatorio
  - **When:** falla el canal de envío
  - **Then:** se debe registrar un log de error visible para Recepción

- **CA3**
  - **Given:** que el paciente recibe la notificación
  - **When:** presiona el botón `Confirmar`
  - **Then:** el sistema debe registrar la confirmación de asistencia de forma inmediata

## Conclusión

Como resultado de este ejercicio se obtiene: 

* Una pauta de requerimientos iniciales para un sistema
* Identificación de restricciones de negocio
* Identificación de requerimientos no funcionales iniciales y mínimos (que sirven como input para el diseño técnico del sistema)
* Priorización de funcionalidades para elaborar un plan de trabajo coherente y negociar alcances
* Criterios de aceptación para reducir ambiguedad y comenzar a diseñar los comportamientos esperados del sistema junto con sus pruebas iniciales desde etapas tempranas

Esto se puede considerar un buen input de alto nivel, que se debe complementar con: 

- Vistas de Casos de Uso para facilitar comunicacion y entendimeinto entre los participantes del equipo
- Especificación detallada de casos de uso (ver documentos de clase 4) que sirven para por ejemplo: Crear un Spec (Especificación detallada) para desarrollo agéntico. 
- Diagrama de entidades (clases) inicial que puede ser usado como parte del diseño de software.