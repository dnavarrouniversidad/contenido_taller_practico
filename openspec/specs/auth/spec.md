# Auth Specification

## Purpose

Authentication and authorization mechanisms for the medical appointment management system.
Ensures that only identified and authorized users can access system resources according to their role.

Applies to: **RNF1** (authentication and authorization), **RNF2** (access auditing).

## Requirements

### Requirement: User Authentication
The system MUST authenticate users before granting access to any protected resource.
A JWT token SHALL be issued upon successful login.

#### Scenario: Successful login
- GIVEN a user with valid credentials (username and password)
- WHEN the user submits the login form
- THEN a JWT token is returned
- AND the user is redirected to their role-specific dashboard

#### Scenario: Invalid credentials
- GIVEN a user with invalid credentials
- WHEN the user submits the login form
- THEN an authentication error is displayed
- AND no token is issued

### Requirement: Role-Based Authorization
The system MUST enforce access control based on user roles.
Each role SHALL only access the resources and actions permitted for that role.

Roles: `paciente`, `tratante`, `recepcionista`, `administrador`.

#### Scenario: Receptionist accesses patient list
- GIVEN a user authenticated as `recepcionista`
- WHEN the user requests the patient list
- THEN the system returns the list of patients

#### Scenario: Patient tries to access another patient's record
- GIVEN a user authenticated as `paciente`
- WHEN the user attempts to access a different patient's record
- THEN the system returns a 403 Forbidden response
- AND access is denied with an appropriate message

### Requirement: Access Auditing
The system MUST log all access and modification events for traceability.
Audit records SHALL include: who performed the action, when, and what action was taken.

This requirement applies to **RNF2**.

#### Scenario: Appointment confirmation audit
- GIVEN a receptionist performs a check-in on an appointment
- WHEN the appointment state changes to `confirmada`
- THEN the system records the confirming user ID and timestamp
- AND this record is persisted in the audit log

### Requirement: Session Termination
The system SHALL allow users to explicitly end their session.
Upon logout, the JWT token MUST be invalidated.

#### Scenario: Explicit logout
- GIVEN an authenticated user
- WHEN the user triggers the logout action
- THEN the session token is invalidated
- AND subsequent requests with that token are rejected
