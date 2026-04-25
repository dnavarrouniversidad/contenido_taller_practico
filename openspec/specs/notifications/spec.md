# Notifications Specification

## Purpose

Automated and manual notification system for patients and treating physicians.
Covers appointment reminders, confirmation of attendance from notifications, and error logging.

Applies to: **CU5** (patient notifications), **CU13** (physician notifications),
**CU14** (automated reminders).

## Requirements

### Requirement: Patient Notifications
The system SHALL notify patients about relevant events related to their appointments.
Notifications MUST be delivered via active notification channels configured for the patient.

Applies to **CU5**.

#### Scenario: Patient receives notification of confirmed appointment
- GIVEN a patient has an appointment whose state changed to `confirmada`
- WHEN the state transition occurs
- THEN the system sends a notification to the patient through their configured channel

### Requirement: Physician Notifications
The system SHALL notify treating physicians about changes to their schedule.
Physicians MUST receive notifications when appointments are created, rescheduled, or cancelled.

Applies to **CU13**.

#### Scenario: Physician notified of new appointment
- GIVEN a receptionist or patient creates a new appointment for a physician
- WHEN the appointment is saved in `pendiente` state
- THEN the system sends a notification to the treating physician

#### Scenario: Physician notified of reschedule
- GIVEN an existing appointment for a physician is rescheduled
- WHEN the new date and time are confirmed
- THEN the system notifies the physician of the change

### Requirement: Automated Appointment Reminders
The system MUST automatically schedule reminders when a new appointment is created.
Reminders SHALL be sent at T-24h and T-2h before the scheduled appointment time.
The system MUST log an error when a reminder delivery fails.

Applies to **CU14**.

#### Scenario: Reminders scheduled on appointment creation
- GIVEN a new appointment is created in `pendiente` or `confirmada` state
- WHEN the appointment is saved
- THEN the system schedules a T-24h reminder and a T-2h reminder for the patient

#### Scenario: Reminder delivery failure logged
- GIVEN the system attempts to send a reminder
- WHEN the delivery channel fails
- THEN the system records a delivery error log
- AND the error is visible to Recepción for follow-up

#### Scenario: Patient confirms attendance from reminder
- GIVEN a patient receives a reminder notification with a confirmation button
- WHEN the patient presses the `Confirmar` button
- THEN the system immediately records the attendance confirmation
- AND the appointment state is updated accordingly
