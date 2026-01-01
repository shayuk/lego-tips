# BEFORE Audit: Current Auth + Admin Logic

## Admin Logic Locations

### 1. Admin Email List
- **File**: `src/config/authRoles.ts`
- **Current emails**: 
  - `krimishay68@gmail.com`
  - `elad.assif@gmail.com` (NOTE: user specified `eladassif@gmail.com` - will fix)
- **Function**: `isAdminEmail(email)` - case-insensitive check

### 2. Admin Button Visibility
- **File**: `src/components/Header.tsx`
- **Lines**: 44-48
- **Logic**: `{isAdmin && (<Link to="/admin">ניהול מערכת</Link>)}`
- **Hook**: Uses `useUser()` from `UserContext`

### 3. Admin Route Protection
- **File**: `src/auth/AdminRoute.tsx`
- **Lines**: 14-57
- **Behavior**:
  - If loading → shows "טוען..."
  - If not logged in → redirects to `/auth`
  - If logged in but not admin → shows "גישה נדחתה" message
  - If admin → renders children

### 4. Auth Context
- **File**: `src/contexts/UserContext.tsx`
- **Hook**: `useUser()` returns `{ user, role, isAdmin, isLoading }`
- **Admin check**: Uses `isAdminEmail()` from `authRoles.ts`
- **Provider**: `UserProvider` wraps app in `main.tsx`

## Admin Routes

### Protected Admin Route
- **Path**: `/admin`
- **Component**: `AdminPage` (from `src/pages/AdminPage.tsx`)
- **Protection**: Wrapped in `<AdminRoute>` component

## Current Auth Flow

### FirebaseUI Auth Page
- **File**: `src/pages/AuthPage.tsx`
- **Route**: `/auth`
- **Features**: Email/password + Google sign-in via FirebaseUI
- **Redirect**: After login → navigates to `/`

### Protected Routes (require login)
All redirect to `/auth` if not logged in:
- `/` (HomePageLayout)
- `/assessment-builder` (AssessmentBuilderPageLayout)
- `/my-assessments` (MyAssessmentsPageLayout)
- `/teaching-library` (TeachingLibraryPageLayout)
- `/help` (HelpPageLayout)
- `/pending-submissions` (PendingSubmissionsPageLayout)

### Route Guards
- **ProtectedRoute**: `src/auth/ProtectedRoute.tsx` - redirects to `/auth` if not logged in
- **AdminRoute**: `src/auth/AdminRoute.tsx` - redirects to `/auth` if not logged in, shows access denied if not admin

## FirebaseUI Usage

### Files using FirebaseUI:
1. `src/pages/AuthPage.tsx` - imports and uses `firebaseui`
2. `package.json` - dependency: `"firebaseui": "^6.1.0"`

### CSS Import:
- `src/pages/AuthPage.tsx` imports `"firebaseui/dist/firebaseui.css"`

## Summary

**Admin Logic Flow:**
1. User logs in → `UserContext` checks email via `isAdminEmail()`
2. If admin → `isAdmin = true` → button visible + route access granted
3. If not admin → `isAdmin = false` → button hidden + route blocked

**Current Issues:**
- Admin email typo: `elad.assif@gmail.com` vs `eladassif@gmail.com` (user specified latter)
- FirebaseUI dependency needs removal
- Auth route is `/auth` but Header links to `/login` (inconsistency)

