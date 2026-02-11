# DarkWatch - Visual Application Map

## Complete User Journey Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                            │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Hero Section - "Protect Your Identity on Dark Web"            │ │
│  │ Features Grid - 6 key features showcased                      │ │
│  │ Stats Section - User testimonials and metrics                 │ │
│  │ How It Works - 3-step process visualization                   │ │
│  │ Call-to-Action Sections - Multiple engagement points          │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                              ↓                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Navigation Bar - DarkWatch Logo + Auth Buttons               │  │
│  │ • [Client Sign In] ━━━━━━━━┓                                 │  │
│  │ • [Admin Portal] ━━━━━━━┓  ┃                                 │  │
│  │ • [Dashboard] (if auth) ┃  ┃                                 │  │
│  └──────────────────────────┼──┼─────────────────────────────────┘  │
└─────────────────────────────┼──┼──────────────────────────────────────┘
                              ┃  ┃
                ┌─────────────┘  └─────────────┐
                ↓                              ↓
        ┌──────────────────┐           ┌──────────────────┐
        │   SIGNIN (/signin)│           │ADMIN SIGNIN      │
        │  (Public Route)   │           │(/admin/signin)   │
        ├──────────────────┤           ├──────────────────┤
        │ Email Input      │           │ Email Input      │
        │ Password Input   │           │ Password Input   │
        │ [Sign In Button] │           │ [Sign In Button] │
        │                  │           │                  │
        │ Demo Creds:      │           │ Demo Creds:      │
        │ user@example.com │           │admin@darkwatch   │
        │ password: any6+  │           │password: any6+   │
        └────┬─────────────┘           └────┬─────────────┘
             ↓                              ↓
        ✅ Client Authenticated      ✅ Admin Authenticated
             ↓                              ↓
        Store in Context             Store in Context
        Navigate to /home            Navigate to /admin

═════════════════════════════════════════════════════════════════════════════

PROTECTED CLIENT ROUTES:                PROTECTED ADMIN ROUTES:

┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│    HOME PAGE (/home)             │   │  ADMIN DASHBOARD (/admin)        │
│  [ClientLayout Wrapper]          │   │  [AdminLayout Wrapper]           │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│                                  │   │                                  │
│ [NavBar] [Logo] [Links]          │   │ [Sidebar] [Logo] [Nav Items]     │
│          Home | History          │   │          Dashboard               │
│          [User] [SignOut]        │   │          Manage Links            │
│                                  │   │          Scan History            │
├──────────────────────────────────┤   │          [User] [SignOut]        │
│                                  │   │                                  │
│ Hero: "Check Your Data"          │   │ Welcome Message                  │
│ [KeywordInput Component]         │   │ Statistics Cards                 │
│  ✓ Add Keywords                  │   │ Quick Actions                    │
│  ✓ Remove Keywords               │   │ System Status                    │
│  ✓ View Added Keywords           │   │                                  │
│ [Scan Now Button] ───────────┐   │   │                                  │
│                              │   │   │                                  │
│ Features Section             │   │   │                                  │
│ Statistics                   │   │   │                                  │
│ CTA Section                  │   │   │                                  │
│                              │   │   │                                  │
│ [View History Button] ────┐  │   │   │                                  │
│                           │  │   │   │                                  │
└───────────────────────────┼──┼───┘   └──────────────────────────────────┘
                            │  │
                  ┌─────────┘  │
                  │  ┌─────────┴─────────────────┐
                  │  │                           │
                  ↓  ↓                           ↓
        ┌──────────────────────────┐    ┌──────────────────────────┐
        │ DASHBOARD (/dashboard)   │    │ADMIN LINKS(/admin/links) │
        │ [ClientLayout Wrapper]   │    │[AdminLayout Wrapper]     │
        ├──────────────────────────┤    ├──────────────────────────┤
        │                          │    │                          │
        │ [NavBar] (same)          │    │ [Sidebar] (same)         │
        │                          │    │                          │
        ├──────────────────────────┤    ├──────────────────────────┤
        │                          │    │                          │
        │ Scan Status:             │    │ Link Management:         │
        │ ▓▓▓▓▓▓▓▓▓░ 80%           │    │ • [+ Add Link]           │
        │                          │    │ • Link List Table:       │
        │ [ScanProgress Component] │    │   - Name                 │
        │  Step 1: Initialize      │    │   - URL                  │
        │  Step 2: Connect         │    │   - Status               │
        │  Step 3: Scan...         │    │   - Actions (edit/del)   │
        │  Step 4: Analyze...      │    │ • Enable/Disable Toggle  │
        │  Complete!               │    │ • Search & Filter        │
        │                          │    │ • Statistics Cards       │
        │ [ScanResult Component]   │    │                          │
        │ ✓ Status: Safe / ⚠ Breach│   │                          │
        │ • Breached Sites:        │    │                          │
        │   - site1.dark           │    │                          │
        │   - site2.dark           │    │                          │
        │ • Keywords Found:        │    │                          │
        │   - email@gmail.com      │    │                          │
        │   - password123          │    │                          │
        │                          │    │                          │
        │ [New Scan] ────────────┐ │    │                          │
        │ [View History] ─────┐  │ │    │                          │
        │                    │  │ │    │                          │
        └────────────────────┼──┼─┘    └──────────────────────────┘
                             │  │
                   ┌─────────┘  └──────────────────┐
                   ↓                               ↓
        ┌──────────────────────────┐    ┌──────────────────────────┐
        │ HISTORY (/history)       │    │ADMIN HISTORY             │
        │ [ClientLayout Wrapper]   │    │(/admin/history)          │
        ├──────────────────────────┤    │[AdminLayout Wrapper]     │
        │                          │    ├──────────────────────────┤
        │ [NavBar] (same)          │    │ [Sidebar] (same)         │
        │                          │    │                          │
        ├──────────────────────────┤    ├──────────────────────────┤
        │                          │    │                          │
        │ Filters:                 │    │ Filters:                 │
        │ • Status (All/Safe/Breach)    │ • Status (All/Safe/Breach)
        │ • Keyword Search         │    │ • User Filter            │
        │ • Date Range             │    │ • Keyword Search         │
        │ • [CSV Export]           │    │ • Date Range             │
        │                          │    │ • [CSV Export]           │
        │ [Scan History Table]     │    │                          │
        │ Date | Keywords | Status │    │ [All Scans Table]        │
        │ ──────────────────────── │    │ User | Keywords | Status │
        │ 2/4  | email@... | Safe  │    │ ──────────────────────── │
        │ 2/3  | phone... | Breach │    │ user1 | email@... | Safe │
        │ 2/2  | domain...| Safe   │    │ user2 | phone...| Breach │
        │                          │    │ admin | domain..| Safe   │
        │ [Click to Expand]        │    │                          │
        │ Scan Details:            │    │ [Click to Expand]        │
        │ • User: user@example.com │    │ Scan Details:            │
        │ • Duration: 45 seconds   │    │ • User: user@example.com │
        │ • Sources: 3/5 enabled   │    │ • Duration: 45 seconds   │
        │ • Breached Sites:        │    │ • Sources: 3/5 enabled   │
        │   - darksite1.onion      │    │ • Breached Sites:        │
        │                          │    │   - darksite1.onion      │
        │ [Home]                   │    │                          │
        │                          │    │ [Dashboard]              │
        │                          │    │                          │
        └──────────────────────────┘    └──────────────────────────┘


═════════════════════════════════════════════════════════════════════════════

DATA FLOW DIAGRAM:

┌──────────────────────────────┐
│    AuthContext               │
├──────────────────────────────┤
│ State:                       │
│  • currentUser               │
│  • isAuthenticated           │
│  • userRole (client/admin)   │
│                              │
│ Methods:                     │
│  • signIn(email, password)   │
│  • signOut()                 │
│  • signUp() [disabled]       │
└───────────┬──────────────────┘
            │ Provides auth state
            │ to all pages
            ↓
        ┌─────────────┐
        │ AuthGuard   │
        │ Protects    │
        │ Routes      │
        └─────────────┘


┌──────────────────────────────┐
│    ScanContext               │
├──────────────────────────────┤
│ State:                       │
│  • keywords[]                │
│  • scanHistory[]             │
│  • darkWebLinks[]            │
│     - id, name, url          │
│     - status (enabled/disabled)│
│                              │
│ Methods:                     │
│  • addKeyword()              │
│  • removeKeyword()           │
│  • addScanResult()           │
│  • toggleDarkWebLink()       │
│  • addDarkWebLink()          │
└───────────┬──────────────────┘
            │ Used by:
            ├─ Home (keywords)
            ├─ Dashboard (scan, results)
            ├─ History (history data)
            └─ Admin (link management)


COMPONENT HIERARCHY:

App
├── BrowserRouter
│   ├── Routes
│   │   ├── / → Landing (public)
│   │   ├── /signin → SignIn (public)
│   │   ├── /admin/signin → AdminSignIn (public)
│   │   ├── /home → AuthGuard → ClientLayout → Home (protected)
│   │   ├── /dashboard → AuthGuard → ClientLayout → Dashboard (protected)
│   │   ├── /history → AuthGuard → ClientLayout → History (protected)
│   │   ├── /admin → AuthGuard → AdminLayout → AdminDashboard (protected)
│   │   ├── /admin/links → AuthGuard → AdminLayout → AdminLinks (protected)
│   │   ├── /admin/history → AuthGuard → AdminLayout → AdminHistory (protected)
│   │   └── * → NotFound
│   │
│   ├── AuthProvider
│   └── ScanProvider
│       └── QueryClientProvider


SCAN WORKFLOW:

User on /home:
  ↓
[Add Keywords] via KeywordInput
  ↓ (stored in ScanContext)
[Click Scan Now]
  ↓
Navigate to /dashboard
  ↓
ScanProgress loads enabled darkWebLinks:
  • Filter: darkWebLinks where status === 'enabled'
  • Only enabled sources are scanned
  • Example: 5 sources total → 3 enabled → scan only 3
  ↓
Simulate scanning steps:
  • Step 1: Initialize
  • Step 2: Connect to sources
  • Step 3: Query data
  • Step 4: Analyze results
  ↓
Generate results (random safe/breached status)
  ↓
ScanResult shows:
  • Safe / Breached status
  • Breached websites list
  • Matched keywords
  ↓
User can:
  • [New Scan] → back to /home
  • [View History] → to /history


═════════════════════════════════════════════════════════════════════════════

KEY CONNECTIONS:

✓ Landing → SignIn → Home ✓ Complete workflow
✓ Landing → AdminSignIn → Admin Dashboard ✓ Complete workflow
✓ Home → Dashboard → History ✓ Client scanning workflow
✓ AdminDashboard → AdminLinks ✓ Link management
✓ AdminDashboard → AdminHistory ✓ Scan history
✓ All routes auth guarded ✓ Protected access
✓ Mobile responsive ✓ Works on all devices
✓ Consistent layouts ✓ Client & Admin layouts
✓ Data persistence ✓ Using contexts
✓ Navigation bars ✓ All pages have navigation


═════════════════════════════════════════════════════════════════════════════
Status: ✅ ALL CONNECTIONS COMPLETE & WORKING
Last Updated: February 4, 2026
═════════════════════════════════════════════════════════════════════════════
```
