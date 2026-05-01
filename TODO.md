# TODO - User Dashboard Design Update

## Plan: Match User Dashboard design to Admin Dashboard (without modifying Admin)

### Files to Edit:

1. **src/pages/UserDashboard.jsx**
   - Add sidebar minimize state
   - Add window resize handling (like Admin)
   - Add sidebar minimize toggle handler
   - Update sidebar props

2. **src/components/UserSection/UserSidebar.jsx**
   - Add minimize button for desktop
   - Add overlay backdrop for mobile (like Admin)
   - Add minimized prop handling
   - Update styling to match Admin sidebar

3. **src/components/UserSection/UserTopbar.jsx**
   - Change to fixed positioning with sidebar-aware left margin
   - Update to use `sidebarMinimized` prop (like Admin Topbar)

4. **src/components/UserSection/DashboardContent.jsx**
   - Change to fixed positioning with proper padding (like Admin Main)
   - Update layout to match Admin Main component

### Steps:
- [x] 1. Update UserDashboard.jsx with admin-like state management
- [x] 2. Update UserSidebar.jsx with minimize and overlay features
- [x] 3. Update UserTopbar.jsx with fixed positioning
- [x] 4. Update DashboardContent.jsx with proper fixed positioning

## Completed!
