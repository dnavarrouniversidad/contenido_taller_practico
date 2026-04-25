# Waitlist Specification

## Purpose

Management of patient waitlists for physician appointments and specialty-based overbook slots.
Allows receptionists to manage demand overflow when no immediate slot is available.

Applies to: **CU9** (manage waitlist and overbook slots).

## Requirements

### Requirement: Patient Waitlist Management
The system SHALL allow a receptionist to add a patient to a waitlist when no appointment slots are available.
A waitlist entry SHALL reference the desired physician or specialty.

Applies to **CU9**.

#### Scenario: Receptionist adds patient to waitlist
- GIVEN no available appointment slot exists for the desired physician or specialty
- WHEN the receptionist creates a waitlist entry for the patient
- THEN the entry is saved with the patient ID, physician/specialty reference, and request timestamp

#### Scenario: Waitlist entry removed when appointment is assigned
- GIVEN a patient is on the waitlist for a physician
- WHEN an available slot is assigned to the patient and an appointment is created
- THEN the waitlist entry is removed
- AND the patient is notified of the new appointment

### Requirement: Waitlist Query
The system SHALL allow a receptionist to query the current waitlist.
The list SHOULD be filterable by physician and by specialty.

#### Scenario: Receptionist views waitlist for a physician
- GIVEN a receptionist is authenticated
- WHEN the receptionist requests the waitlist filtered by a specific physician
- THEN the system returns all pending waitlist entries for that physician in request order

### Requirement: Overbook Slot Management
The system SHOULD allow a receptionist to manage overbook (sobrecupo) slots for a physician.
Overbook slots SHALL be created explicitly and SHALL not bypass the availability validation of regular slots.

#### Scenario: Overbook slot assigned to waiting patient
- GIVEN an overbook slot is available for a physician
- WHEN the receptionist assigns the slot to the first waiting patient on the waitlist
- THEN an appointment is created for the patient in `pendiente` state
- AND the waitlist entry for that patient is removed
