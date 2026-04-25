# Availability Specification

## Purpose

Configuration and visualization of physician availability and appointment modality.
Allows treating physicians to define their working schedule and view their daily agenda.

Applies to: **CU10** (configure available hours), **CU11** (configure attendance modality),
**CU12** (view agenda).

## Requirements

### Requirement: Physician Availability Configuration
The system SHALL allow a treating physician to define the time slots when they are available for appointments.
Available slots MUST be within the working hours: 09:00–17:00, Monday to Friday.

Applies to **CU10**.

#### Scenario: Physician adds available slot
- GIVEN a physician authenticated as `tratante`
- WHEN the physician creates a new availability slot for a valid working day and time
- THEN the slot is registered in the system
- AND the slot becomes bookable by patients and receptionists

#### Scenario: Slot outside working hours rejected
- GIVEN a physician attempts to create a slot outside 09:00–17:00 or on a weekend
- WHEN the slot is submitted
- THEN the system rejects the request with a validation error
- AND an appropriate message is shown

#### Scenario: Duplicate slot blocked
- GIVEN a physician already has a slot at a specific date and time
- WHEN the physician attempts to create another slot at the same date and time
- THEN the system rejects the request with a conflict error

#### Scenario: Slot with existing appointment cannot be deleted
- GIVEN an availability slot that has a confirmed or pending appointment assigned
- WHEN the physician attempts to delete that slot
- THEN the system rejects the deletion with a conflict error

### Requirement: Attendance Modality Configuration
The system SHALL allow a treating physician to configure their appointment modality.
Valid modalities are: `presencial` (in-person), `online`, or `ambas` (both).

Applies to **CU11**.

#### Scenario: Physician sets modality to online
- GIVEN a physician authenticated as `tratante`
- WHEN the physician updates their modality to `online`
- THEN the system saves the new modality
- AND future appointments for this physician will reflect the online modality

### Requirement: Physician Agenda View
The system MUST allow a treating physician or receptionist to view the physician's full schedule for a given date.
The agenda MUST reflect real-time updates when appointments are created, confirmed, or cancelled.

Applies to **CU12**.

#### Scenario: Physician views their daily agenda
- GIVEN a physician authenticated as `tratante`
- WHEN the physician queries their agenda for a specific date
- THEN the system returns all appointments and available slots for that date
- AND the information is current in real time

#### Scenario: Agenda reflects appointment changes in real time
- GIVEN a new appointment has just been created for a physician
- WHEN the physician or receptionist views the physician's agenda
- THEN the new appointment appears in the agenda immediately
