# Appointments Specification

## Purpose

Core functionality for creating, confirming, rescheduling, and cancelling medical appointments.
Enforces availability constraints, state transitions, and no-show tracking.

Applies to: **CU1** (schedule appointment), **CU2** (confirm attendance), **CU3** (reschedule),
**CU4** (attend appointment), **CU7** (receptionist confirm), **CU8** (receptionist reschedule),
**RN1** (single state), **RN2** (no overlapping appointments), **RN4** (reschedule limit).

## Requirements

### Requirement: Appointment Scheduling
The system MUST allow a receptionist or patient to create a new appointment.
The appointment SHALL be created in `pendiente` state.
The system MUST validate that the selected time slot is available for the chosen physician.

Applies to **CU1**, **RN1**, **RN2**.

#### Scenario: Successful appointment creation
- GIVEN a receptionist selects a physician and an available time slot
- WHEN the receptionist confirms the appointment
- THEN the appointment is created in `pendiente` state
- AND the physician's schedule is updated in real time
- AND reminders are scheduled for T-24h and T-2h before the appointment

#### Scenario: Time slot already booked
- GIVEN a receptionist selects a physician and a time slot already reserved for another patient
- WHEN the receptionist attempts to book that slot
- THEN the system blocks the selection
- AND an error message is shown indicating the slot is not available

This applies to **RN2**: a physician cannot have two patients at the same time.

#### Scenario: Appointment created in pending state
- GIVEN a valid appointment request with an available slot
- WHEN the appointment is saved
- THEN the appointment state is exclusively `pendiente`
- AND no other state is assigned simultaneously

This applies to **RN1**: an appointment can only be in one state at a time.

### Requirement: Appointment Confirmation (Check-in)
The system SHALL allow a receptionist to confirm a patient's attendance.
Confirmation SHALL change the appointment state from `pendiente` to `confirmada`.
The system MUST record the confirming user and the timestamp.

Applies to **CU7**, **RN1**, **RNF2**.

#### Scenario: Successful check-in
- GIVEN an appointment in `pendiente` state
- WHEN the receptionist performs check-in
- THEN the appointment state changes to `confirmada`
- AND the system records the receptionist's ID and the confirmation timestamp

#### Scenario: Confirmation attempted on non-pending appointment
- GIVEN an appointment that is not in `pendiente` state
- WHEN the receptionist attempts to confirm it
- THEN the system rejects the action with a conflict error
- AND the appointment state remains unchanged

### Requirement: No-Show Detection
The system MUST suggest marking an appointment as `no-show` when the patient does not attend.
A no-show SHOULD be suggested when more than 24 hours have passed since the scheduled time without a check-in.

Applies to **CU7** CA2.

#### Scenario: Automatic no-show suggestion
- GIVEN an appointment whose scheduled time has passed by more than 24 hours
- AND no check-in has been recorded
- THEN the system suggests marking the appointment as `no-show`

#### Scenario: Manual no-show confirmation
- GIVEN a receptionist reviews overdue appointments
- WHEN the receptionist marks an appointment as `no-show`
- THEN the appointment state changes to `no-show`
- AND the event is recorded in the audit log

### Requirement: Appointment Rescheduling
The system SHALL allow a patient or receptionist to change the date and time of an existing appointment.
A patient MUST NOT reschedule the same appointment more than 5 times.

Applies to **CU3**, **CU8**, **RN4**.

#### Scenario: Successful reschedule
- GIVEN an existing appointment with fewer than 5 reschedulings
- WHEN a valid new date and time is submitted
- THEN the appointment is updated to the new date and time
- AND the reschedule count is incremented

#### Scenario: Reschedule limit exceeded
- GIVEN an appointment that has already been rescheduled 5 times
- WHEN a reschedule request is submitted
- THEN the system rejects the request with a validation error
- AND a message is shown indicating the reschedule limit has been reached

This applies to **RN4**: a patient may reschedule a maximum of 5 times.

#### Scenario: New slot unavailable during reschedule
- GIVEN a reschedule request with a new date and time
- AND the requested slot is already occupied by another appointment
- WHEN the reschedule is submitted
- THEN the system rejects the request with a conflict error

### Requirement: Appointment Cancellation
The system SHALL allow a patient, receptionist, or administrator to cancel an appointment.
Cancellation SHALL change the appointment state exclusively to `cancelada`.

Applies to **RN1**.

#### Scenario: Appointment cancelled
- GIVEN an appointment in any active state
- WHEN the cancellation action is triggered
- THEN the appointment state changes to `cancelada`
- AND no other state is assigned simultaneously

### Requirement: Appointment Attendance
The system SHALL support recording whether a patient attended their appointment.
Completion of the appointment SHALL change the state to `completada`.

Applies to **CU4**.

#### Scenario: Appointment completed after attendance
- GIVEN an appointment in `confirmada` state
- WHEN the treating physician marks the appointment as completed
- THEN the appointment state changes to `completada`
