# Patients Specification

## Purpose

Registration and management of patient records in the system.
Covers patient onboarding, data access control, and privacy constraints.

Applies to: **CU6** (register patient), **RN3** (no duplicate registration),
**RN5** (record access only by treating physician), **RN6** (private patient record).

## Requirements

### Requirement: Patient Registration
The system MUST allow a receptionist to register a new patient.
Each patient SHALL be uniquely identified by their national ID (RUT).

Applies to **CU6**.

#### Scenario: Successful patient registration
- GIVEN a receptionist is authenticated
- WHEN the receptionist submits a new patient form with name, email, and RUT
- THEN the patient is created in the system
- AND a unique patient ID is returned

#### Scenario: Duplicate patient registration blocked
- GIVEN a patient with RUT `12345678-9` already exists in the system
- WHEN a receptionist attempts to register another patient with the same RUT
- THEN the system rejects the request with a conflict error
- AND a message is shown indicating the patient already exists

This applies to **RN3**: a patient cannot register twice in the system.

### Requirement: Patient Record Privacy
Patient medical records MUST be private and SHALL only be accessible to the assigned treating physician.
No other actor may query or display a patient's full record.

Applies to **RN5** and **RN6**.

#### Scenario: Treating physician accesses patient record
- GIVEN a physician authenticated as `tratante`
- AND the physician is assigned as the treating doctor for the patient
- WHEN the physician requests the patient's full record
- THEN the system returns the full patient record

#### Scenario: Unauthorized access to patient record denied
- GIVEN any user who is NOT the patient's treating physician
- WHEN they attempt to access the patient's full record
- THEN the system returns a 403 Forbidden response
- AND no patient data is disclosed

#### Scenario: Receptionist searches patients
- GIVEN a receptionist is authenticated
- WHEN the receptionist searches the patient list
- THEN the system returns a paginated list with basic identifying information only
- AND no full medical record data is exposed

### Requirement: Patient Data Update
The system SHALL allow a receptionist or administrator to update a patient's contact information.
Medical record content MUST NOT be modifiable through this endpoint.

#### Scenario: Update patient phone number
- GIVEN a receptionist is authenticated
- WHEN the receptionist submits updated contact data for an existing patient
- THEN the patient record is updated
- AND the previous data is preserved in the audit log
