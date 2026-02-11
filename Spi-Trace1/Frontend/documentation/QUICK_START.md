# DarkWatch Frontend - Quick Start Guide

## Running the Application

### Prerequisites
- Node.js 18+ installed
- npm or bun package manager

### Installation & Development

```bash
cd "c:\Users\vicky\OneDrive\Desktop\New folder 2\dark-watcher"
npm install
npm run dev
```

The application will start at: **http://localhost:8081/**

---

## Test Accounts (Demo Credentials)

### Client Account
- **Email**: `user@example.com`
- **Password**: Any 6+ character string (e.g., `password`, `123456`)
- **Access**: `/home`, `/dashboard`, `/history`

### Admin Account
- **Email**: `admin@darkwatch.com`
- **Password**: Any 6+ character string (e.g., `password`, `123456`)
- **Access**: `/admin`, `/admin/links`, `/admin/history`

---

## Testing the Complete Flow

### Client Scanning Flow (5 minutes)

1. **Start**: Go to http://localhost:8081/
2. **Click**: "Client Sign In" button
3. **Login**: 
   - Email: `user@example.com`
   - Password: `password`
4. **You should see**: Home page with keyword input
5. **Enter Keywords**:
   - Click "Add Keyword" field
   - Type: `john.doe@example.com` (or your test data)
   - Press Enter or click Add
   - Add multiple keywords if desired
6. **Scan**:
   - Click "Scan Now" button
   - Watch the scan progress animation
   - See results appear (Safe or Breached)
7. **View History**:
   - Click "View History" button
   - See your scan history with filters
   - Try filtering by status, date, or keyword
   - Try CSV export

### Admin Management Flow (5 minutes)

1. **Start**: Go to http://localhost:8081/
2. **Click**: "Admin Portal" button
3. **Login**:
   - Email: `admin@darkwatch.com`
   - Password: `password`
4. **You should see**: Admin Dashboard
5. **Manage Links**:
   - Click "Manage Links" in sidebar
   - See list of dark web sources
   - Click "+ Add Link" to add a new source
   - Click the eye/eye-off icon to enable/disable sources
   - Click edit icon to update source details
   - Click trash icon to delete a source
6. **Test Scanning Impact**:
   - Disable some sources
   - Sign out and log in as client
   - Run a scan - note that disabled sources are skipped
7. **View All Scans**:
   - Go back to admin account
   - Click "Scan History" in sidebar
   - See ALL users' scans (not just your own)
   - Filter by user, status, keyword, or date
   - Expand scan details to see what was scanned
   - Try CSV export

---

## Key Features to Test

### ✅ Authentication
- [ ] Sign In with client credentials
- [ ] Sign In with admin credentials
- [ ] Invalid credentials show error message
- [ ] Sign out works from any page
- [ ] Unauthorized access redirects to sign in

### ✅ Client Features
- [ ] Home page loads with navbar and sidebar
- [ ] Can add/remove keywords
- [ ] "Scan Now" button works
- [ ] Scan progress shows step-by-step animation
- [ ] Results display correctly
- [ ] History shows filtered results
- [ ] CSV export downloads

### ✅ Admin Features
- [ ] Admin dashboard loads correctly
- [ ] Can add new dark web sources
- [ ] Can edit source details
- [ ] Can delete sources
- [ ] Enable/Disable toggle switches source status
- [ ] Admin history shows all users' scans
- [ ] Filters work on all pages
- [ ] CSV export includes all data

### ✅ Navigation
- [ ] Landing page navigation buttons work
- [ ] Navbar/sidebar links work
- [ ] Back buttons return to correct page
- [ ] Links in text navigate correctly
- [ ] Mobile menu opens/closes

### ✅ Responsive Design
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Mobile menu appears on small screens
- [ ] All text is readable
- [ ] Buttons are clickable
- [ ] Forms are accessible

---

## File Structure Overview

```
dark-watcher/
├── src/
│   ├── App.tsx .......................... Main routing config
│   ├── main.tsx ......................... Entry point
│   ├── contexts/
│   │   ├── AuthContext.tsx .............. Auth state & logic
│   │   └── ScanContext.tsx .............. Scan history & keywords
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── ClientLayout.tsx ........ Client navbar layout
│   │   │   └── AdminLayout.tsx ......... Admin sidebar layout
│   │   ├── guards/
│   │   │   └── AuthGuard.tsx ........... Route protection
│   │   ├── scan/
│   │   │   ├── KeywordInput.tsx ........ Keyword entry
│   │   │   ├── ScanProgress.tsx ........ Progress display
│   │   │   └── ScanResult.tsx .......... Results display
│   │   └── ui/ ......................... Shadcn UI components
│   └── pages/
│       ├── Landing.tsx ................. / (public)
│       ├── SignIn.tsx .................. /signin (public)
│       ├── Home.tsx .................... /home (protected)
│       ├── Dashboard.tsx ............... /dashboard (protected)
│       ├── History.tsx ................. /history (protected)
│       └── admin/
│           ├── AdminSignIn.tsx ......... /admin/signin
│           ├── AdminDashboard.tsx ...... /admin (protected)
│           ├── AdminLinks.tsx .......... /admin/links (protected)
│           └── AdminHistory.tsx ........ /admin/history (protected)
├── package.json ......................... Dependencies & scripts
├── vite.config.ts ....................... Vite configuration
├── tsconfig.json ........................ TypeScript config
└── README.md ............................ Project readme
```

---

## Customization Notes

### Change Styling
- Colors defined in CSS classes (Tailwind)
- Primary color: `cyber` (blue/cyan gradient)
- Update in individual component files

### Add New Keywords
- Keywords are stored in `ScanContext`
- Add to INITIAL_KEYWORDS in `src/contexts/ScanContext.tsx`

### Add New Dark Web Sources
- Sources stored in `ScanContext`
- Add to INITIAL_DARK_WEB_LINKS in `src/contexts/ScanContext.tsx`
- Include `id`, `name`, `url`, and `status` fields

### Extend Admin Features
- Edit pages in `src/pages/admin/`
- Add new routes in `src/App.tsx`
- Protect with `AuthGuard` component

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8081
# Or Vite will automatically try next available port
```

### TypeScript Errors
```bash
npm run build  # Check for compilation errors
```

### Styling Issues
```bash
# Ensure Tailwind CSS is compiled
npm run dev  # Vite watches for changes
```

### Authentication Issues
- Check browser localStorage for `darkwatch_user`
- Demo credentials: email/password with any 6+ char password
- Admin email must be exactly `admin@darkwatch.com`

---

## Build for Production

```bash
npm run build
# Output goes to ./dist directory

# Preview production build
npm run preview
```

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests (if configured)

---

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Routing
- **Shadcn UI** - UI components
- **Lucide Icons** - Icon library
- **Sonner** - Toast notifications

---

## Next Steps

1. **Test all flows** using demo credentials
2. **Connect to backend API** when ready
3. **Replace mock data** with real data
4. **Implement secure authentication** (JWT, sessions)
5. **Add real dark web scanning** service
6. **Deploy to production** (Vercel, Netlify, etc.)

---

## Support

For issues or questions:
1. Check the FRONTEND_FLOW.md for detailed architecture
2. Review connection points in CONNECTION_SUMMARY.md
3. Check individual page files for component logic
4. Review AuthContext and ScanContext for state management

---

**Status**: ✅ Frontend fully connected and functional
**Last Updated**: February 4, 2026
