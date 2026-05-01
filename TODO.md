# Calendar Feature Implementation Plan

## Task
Add a calendar in userdashboard that shows pending and approved appointments as a guide for users to see what dates have appointments.

## Requirements
1. Monthly calendar grid with date numbers
2. Dot/indicator on dates with appointments
3. Hover tooltip showing count of appointments for that day
4. Show only pending and approved appointments (not completed/cancelled)
5. Add as new "Calendar" tab in sidebar

---

## Implementation Steps

### Step 1: Create UserCalendar Component
- File: `src/components/UserSection/UserCalendar.jsx`
- Build monthly calendar grid
- Fetch user's appointments (status: pending, approved)
- Show dot indicator on dates with appointments
- Hover functionality to show appointment count

### Step 2: Update UserSidebar
- File: `src/components/UserSection/UserSidebar.jsx`
- Add Calendar icon import
- Add "Calendar" nav item to navigation

### Step 3: Update DashboardContent
- File: `src/components/UserSection/DashboardContent.jsx`
- Import UserCalendar component
- Add 'calendar' tab case

### Step 4: Test and Verify
- Open app and navigate to new Calendar tab
- Verify dots appear on dates with appointments
- Verify hover shows count

---

## Technical Details

### Data to Fetch
```javascript
// From Supabase 'appointments' table
// - appointment_date
// - status (filter: 'pending' or 'approved')
// - customer_id (current user)
// - services.name (for tooltip details)
```

### UI Components
- Calendar grid (7 columns for days)
- Date cells with dots
- Hover tooltip overlay
- Navigation state management

### Files to Edit
1. Create: `src/components/UserSection/UserCalendar.jsx` (NEW)
2. Edit: `src/components/UserSection/UserSidebar.jsx`
3. Edit: `src/components/UserSection/DashboardContent.jsx`

---

## Status: COMPLETED ✅
