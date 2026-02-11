# DarkWatch Frontend Flow - Complete Architecture

## User Journey Overview

### 1. **Landing Page** (`/`)
- **Entry Point**: Public, unauthenticated users land here
- **Components**: 
  - Navigation bar with dual auth buttons (Client Sign In & Admin Portal)
  - Hero section with features and value proposition
  - Statistics and testimonials
  - Call-to-action sections
- **Navigation Options**:
  - Unauthenticated → `Client Sign In` → `/signin`
  - Unauthenticated → `Admin Portal` → `/admin/signin`
  - Authenticated Client → `Start Scanning` → `/home`
  - Authenticated Admin → `Admin Dashboard` → `/admin`

---

## Client User Flow

### 2. **Client Sign In** (`/signin`)
- **Purpose**: User authentication
- **Protected**: No (but navigates to protected routes post-auth)
- **Features**:
  - Email + Password authentication
  - Demo credentials shown for testing
  - "Learn more" link back to landing page
  - Client routing post-login → `/home`
  - Admin routing post-login → `/admin`
- **Demo Credentials**:
  - Client: `user@example.com` (password: any 6+ chars)
  - Admin: `admin@darkwatch.com` (password: any 6+ chars)

### 3. **Home Page** (`/home`)
- **Layout**: ClientLayout (with navbar + sidebar)
- **Protected**: ✅ Yes (AuthGuard - client role only)
- **Purpose**: Keyword input and scan initiation
- **Features**:
  - Keyword Input component to add/remove keywords
  - "Scan Now" button that navigates to `/dashboard`
  - Features showcase section
  - Statistics and CTA sections
  - Navigation links: History
  - User info display + Sign Out button

### 4. **Dashboard** (`/dashboard`)
- **Layout**: ClientLayout
- **Protected**: ✅ Yes (AuthGuard - client role only)
- **Purpose**: Real-time scan progress and results
- **Features**:
  - **ScanProgress Component**: Step-by-step scanning animation
    - Only scans enabled dark web links from `ScanContext`
    - Simulates real-time progress
  - **ScanResult Component**: Displays scan results
    - Safe or Breached status
    - Breached websites list
    - Matched keywords
  - **Action Buttons**:
    - "New Scan" → `/home` (clears keywords)
    - "View History" → `/history`
- **Empty State**: If no keywords, redirects to `/home`

### 5. **History Page** (`/history`)
- **Layout**: ClientLayout
- **Protected**: ✅ Yes (AuthGuard - client role only)
- **Purpose**: View user's scan history
- **Features**:
  - Filters:
    - Status filter (All / Safe / Breached)
    - Keyword search filter
    - Date range filter
  - Expandable rows showing:
    - Scan date/time
    - Keywords scanned
    - Breach status
    - Website affected
  - CSV export functionality
  - Data restricted to current user

---

## Admin User Flow

### 6. **Admin Sign In** (`/admin/signin`)
- **Purpose**: Admin-only authentication
- **Protected**: No (but email must be @darkwatch.com domain)
- **Features**:
  - Email validation (must end with @darkwatch.com)
  - Strong password validation
  - Demo credentials shown
  - Routes to `/admin` on successful login
- **Demo Admin**: `admin@darkwatch.com`

### 7. **Admin Dashboard** (`/admin`)
- **Layout**: AdminLayout (with sidebar navigation)
- **Protected**: ✅ Yes (AuthGuard - admin role only)
- **Purpose**: Admin overview and control center
- **Navigation**:
  - Dashboard (current page)
  - Manage Links (`/admin/links`)
  - Scan History (`/admin/history`)
- **Features**:
  - Statistics overview
  - Quick actions
  - System health status

### 8. **Admin Links Management** (`/admin/links`)
- **Layout**: AdminLayout
- **Protected**: ✅ Yes (AuthGuard - admin role only)
- **Purpose**: Manage dark web sources for scanning
- **Features**:
  - **Add Links**: Dialog form to add new dark web sources
  - **Edit Links**: Update existing link details
  - **Delete Links**: Remove sources
  - **Enable/Disable Toggle**: Control which links are active
    - ⚠️ **IMPORTANT**: Only enabled links are scanned by the system
  - **Statistics Cards**: Shows total, enabled, and disabled links
  - **Search & Filter**: Find links by name/URL
- **Data Storage**: Uses `ScanContext` for in-memory data persistence
- **Scanning Impact**: When user initiates scan from `/dashboard`:
  - `ScanProgress` component filters `darkWebLinks`
  - Only sources with `status === 'enabled'` are scanned
  - Disabled links are skipped entirely

### 9. **Admin History** (`/admin/history`)
- **Layout**: AdminLayout
- **Protected**: ✅ Yes (AuthGuard - admin role only)
- **Purpose**: View all users' scan history (admin-only)
- **Features**:
  - **Filters**:
    - Status filter (All / Safe / Breached)
    - User filter (by email)
    - Keyword search
    - Date range filter
  - **Expandable Details**:
    - User email
    - Keywords searched
    - Breached websites
    - Scan duration
    - Timestamp
  - **CSV Export**: Download filtered history
  - **Admin-Only Access**: Shows ALL users' scans, not just current user

---

## Authentication & Authorization

### Auth Context (`AuthContext.tsx`)
- **Mock Data**:
  ```
  MOCK_USERS = [
    { id: '1', email: 'user@example.com', role: 'client', password: '(any 6+ chars)' },
    { id: '2', email: 'admin@darkwatch.com', role: 'admin', password: '(any 6+ chars)' }
  ]
  ```
- **Methods**:
  - `signIn(email, password)`: Validates credentials and sets user
  - `signOut()`: Clears user and redirects to landing
  - `signUp()`: Currently disabled (redirects to signin)

### Auth Guard (`AuthGuard.tsx`)
- **Purpose**: Protect routes by role
- **Protected Routes**:
  - `/home` → client only
  - `/dashboard` → client only
  - `/history` → client only
  - `/admin` → admin only
  - `/admin/links` → admin only
  - `/admin/history` → admin only
- **Behavior**: Redirects unauthorized users to `/signin`

---

## Routing Summary

```
Landing Page ────────────────────────── /
  ├─ Client Sign In ──────────────── /signin ──┐
  │                                             │ ✅ Authenticated (client)
  └─ Admin Portal ────────────────── /admin/signin ──┐
                                                      │ ✅ Authenticated (admin)
                                                      ▼
Client Routes (Protected):                  Admin Routes (Protected):
├─ Home Page ────────────────────── /home   ├─ Dashboard ──── /admin
├─ Dashboard ──────────────────── /dashboard ├─ Manage Links ── /admin/links
└─ History ────────────────────── /history   └─ History ────── /admin/history

Special Routes:
├─ Sign Up ─────────────────────── /signup → /signin (disabled, redirects)
├─ Forgot Password ─────────────── /forgot-password
├─ 404 Not Found ───────────────── * (any unmatched route)
```

---

## Key Features & Connections

### 1. **Keyword-to-Scan Flow**
1. User enters keywords on `/home` (KeywordInput component)
2. Keywords stored in `ScanContext`
3. User clicks "Scan Now"
4. Navigate to `/dashboard`
5. ScanProgress retrieves enabled links from ScanContext
6. Simulates scanning only enabled sources
7. Results stored via `addScanResult()` method

### 2. **Admin Link Management Impact**
- **Enable/Disable Toggle**: Admin toggles link status
- **Immediate Effect**: Next scan will respect new status
- **Example**:
  - 5 total dark web sources in database
  - Admin disables 2 sources (status = 'disabled')
  - Client scans → ScanProgress filters to only 3 enabled sources
  - Results show data only from 3 sources

### 3. **History Filtering**
- **Client History** (`/history`):
  - Shows only current user's scans
  - Can filter by status, keyword, date
- **Admin History** (`/admin/history`):
  - Shows ALL users' scans
  - Can filter by user, status, keyword, date
  - Admin oversight and monitoring

---

## Layout Components

### ClientLayout
- **Navigation**: Responsive header with logo, nav items, user menu
- **Nav Items**: Home, History
- **User Info**: Email display, Sign Out button
- **Mobile**: Hamburger menu with slide-out drawer
- **Footer**: Links and copyright

### AdminLayout
- **Sidebar**: Desktop navigation (Desktop: fixed side, Mobile: overlay)
- **Nav Items**: Dashboard, Manage Links, Scan History
- **User Section**: Admin name, email, Sign Out button
- **Mobile Header**: Hamburger menu, DarkWatch branding
- **Responsive**: Full sidebar on desktop, drawer on mobile

---

## State Management

### AuthContext
- **State**: Current user, authentication status
- **Persistence**: LocalStorage (darkwatch_user)
- **Methods**: signIn, signOut, signUp (disabled)

### ScanContext
- **State**:
  - `keywords`: Array of search terms
  - `scanHistory`: Array of scan results
  - `darkWebLinks`: Array of monitored sources (with enabled/disabled status)
- **Methods**:
  - `addKeyword()`, `removeKeyword()`
  - `clearKeywords()`
  - `addScanResult()`
  - `getAllScanHistory()` (client: filtered by user; admin: all)
  - `addDarkWebLink()`, `updateDarkWebLink()`, `toggleDarkWebLink()`

---

## Protected Routes Implementation

All client and admin routes use `AuthGuard` wrapper:

```tsx
<Route
  path="/dashboard"
  element={
    <AuthGuard allowedRoles={['client']}>
      <Dashboard />
    </AuthGuard>
  }
/>
```

- Checks `AuthContext.user.role`
- If role not allowed: redirects to `/signin`
- If unauthenticated: redirects to `/signin`

---

## Next Steps for Backend Integration

1. **Replace Mock Auth**: Connect SignIn to real API
   - POST `/api/auth/signin` with email/password
   - Return JWT token and user data
   
2. **Replace In-Memory Scan History**:
   - POST `/api/scans` to create new scan
   - GET `/api/scans` to fetch user history
   - GET `/api/scans/all` (admin only) for all scans

3. **Replace In-Memory Dark Web Links**:
   - GET `/api/admin/links` to fetch sources
   - POST/PUT/DELETE `/api/admin/links/:id` for CRUD

4. **Add Real Scanning Service**:
   - Queue scan job on server
   - Scan enabled sources with real dark web monitoring
   - Return results to frontend

5. **Implement Session Management**:
   - JWT tokens with refresh flow
   - Secure token storage (httpOnly cookies)
   - Automatic logout on token expiration

---

## Testing Checklist

- [ ] Landing → Sign In → Home flow works
- [ ] Landing → Admin Sign In → Admin Dashboard flow works
- [ ] Home: Add keywords → Scan Now → Dashboard
- [ ] Dashboard: View scan progress → Results shown
- [ ] Dashboard: "New Scan" button clears keywords and returns to Home
- [ ] Dashboard: "View History" navigates to History page
- [ ] History: Filters work (status, keyword, date)
- [ ] History: CSV export downloads
- [ ] Admin Links: Can add/edit/delete links
- [ ] Admin Links: Enable/disable toggles work
- [ ] Admin Links: Only enabled links appear in next scan
- [ ] Admin History: Shows all users' scans
- [ ] Admin History: Filters work correctly
- [ ] Sign Out: Works from any protected route, returns to landing
- [ ] Navigation: All routes redirect correctly
- [ ] Auth Guard: Blocks unauthorized access

---

## File Structure
```
src/pages/
├── Landing.tsx ..................... Landing page (public)
├── SignIn.tsx ...................... Client signin (public)
├── ForgotPassword.tsx .............. Password reset (public)
├── Home.tsx ........................ Client home (protected)
├── Dashboard.tsx ................... Scan dashboard (protected)
├── History.tsx ..................... Scan history (protected)
├── admin/
│   ├── AdminSignIn.tsx ............. Admin signin (public, email restricted)
│   ├── AdminDashboard.tsx .......... Admin dashboard (protected)
│   ├── AdminLinks.tsx .............. Manage dark web sources (protected)
│   └── AdminHistory.tsx ............ View all scan history (protected)
├── NotFound.tsx .................... 404 page

src/components/
├── layouts/
│   ├── ClientLayout.tsx ............ Client layout with navbar
│   └── AdminLayout.tsx ............. Admin layout with sidebar
├── guards/
│   └── AuthGuard.tsx ............... Route protection component
└── scan/
    ├── KeywordInput.tsx ............ Keyword entry component
    ├── ScanProgress.tsx ............ Scanning progress display
    └── ScanResult.tsx .............. Results display
```
