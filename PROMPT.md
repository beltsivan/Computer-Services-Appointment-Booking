# Appointment Booking System - AI Agent Task Prompt

## Project Context
This system is an Appointment Booking System for a Computer Store.  
The project already has both a User Dashboard and Admin Dashboard, but some features are incomplete or need fixing.

Your task is to analyze the existing codebase and implement/fix the following requirements while preserving the current design, architecture, and coding style.

---

# USER DASHBOARD TASKS

## 1. Fix Recent Appointments in Overview Section
### Current Problem:
The "Recent Appointments" section in the Overview page displays all appointment statuses.

### Required Behavior:
Only appointments with the status:
- COMPLETED

should be displayed in the Recent Appointments section.

### Expected Action:
- Locate the query, API, or filtering logic used for Recent Appointments.
- Filter the displayed records so only completed bookings appear.
- Preserve existing UI styling and layout.

---

## 2. Separate Cancelled Appointments in "My Appointments"
### Current Problem:
In the "My Appointments" sidebar section, cancelled appointments are mixed together with pending and approved appointments.

### Required Behavior:
Appointments should be grouped or separated by status.

### Expected Categories:
- Pending Appointments
- Approved Appointments
- Cancelled Appointments

### Expected Action:
- Modify the appointment listing logic and UI.
- Ensure cancelled appointments are displayed in their own separate section/tab/group.
- Keep the current design consistent.

---

## 3. Make Edit Profile Functional
### Current Problem:
The Edit Profile feature in the Profile sidebar section is not working properly or has no backend/frontend functionality.

### Required Behavior:
Users must be able to:
- Edit their profile information
- Save updated details
- Persist changes to the database
- See updated information immediately after saving

### Expected Action:
- Check both frontend and backend integration.
- Ensure validation is handled properly.
- Handle update success and error messages cleanly.
- Do not break existing authentication/session logic.

---

# ADMIN DASHBOARD TASKS

## 4. Add Confirmation Dialogs Before Actions
### Current Problem:
Admin action buttons perform operations immediately without confirmation.

### Required Behavior:
Before executing important actions, show a confirmation dialog/modal/message.

### Actions That Need Confirmation:
Examples include:
- Approving an appointment
- Marking appointment as Ready to Pick Up
- Cancelling appointments
- Any critical admin action

### Example Confirmation Messages:
- "Are you sure you want to approve this appointment?"
- "Are you sure you want to mark this appointment as ready to pick up?"

### Expected Action:
- Add confirmation modals, alerts, or dialogs.
- Prevent accidental actions.
- Maintain existing UI/UX design consistency.

---

## 5. Display Real Customer Names in Clients Section
### Current Problem:
The Clients sidebar section does not properly display the real names of customers.

### Required Behavior:
The Clients section should display:
- Actual customer full names from the database

instead of:
- usernames
- IDs
- placeholders
- emails only

### Expected Action:
- Trace database relationships and queries.
- Ensure the correct customer name fields are fetched and displayed.
- Preserve current table/list styling.

---

# DEVELOPMENT RULES

## Important Instructions
- Do NOT remove existing features unless necessary.
- Maintain the current project structure.
- Reuse existing components and styles when possible.
- Avoid unnecessary refactoring.
- Ensure all database operations are secure and validated.
- Follow existing naming conventions.
- Test both frontend and backend functionality after changes.

---

# Expected Deliverables
The implementation should result in:
- Fully working user dashboard fixes
- Fully working admin dashboard improvements
- Clean and maintainable code
- No broken existing features
- Proper UI feedback and validation

---

# Final Instruction
Analyze the existing system first before making modifications.  
Implement the missing functionality carefully and ensure compatibility with the current codebase.