# CMS User Interface Visual Preview

## Overview
The CMS (Content Management System) has a clean, modern interface built with shadcn/ui components, featuring dark mode support and responsive design.

---

## 1. Login Page (`/admin/login`)

**Layout:**
- Centered card on a light gray background
- White card with rounded corners and subtle shadow
- Clean, minimalist design

**Elements:**
- **Title:** "Admin Login" (large, bold)
- **Description:** "Enter your credentials to access the CMS"
- **Email Field:** Text input with placeholder "admin@hausmatch.com"
- **Password Field:** Password input (masked)
- **Sign In Button:** Full-width black button with white text

**Screenshot:** login-page.png

---

## 2. Admin Dashboard (`/admin`)

**Layout:**
- Left sidebar (256px wide) with navigation
- Main content area on the right
- Header with welcome message

**Sidebar (Left):**
- **Header:** "HausMatch CMS" logo with home icon
- **Navigation Menu:**
  - Dashboard (active state with blue highlight)
  - Users (Administrator only)
  - House Builders
  - Blog Posts
- **Footer:**
  - User info (name/email and role badge)
  - Sign Out button

**Main Content:**
- **Page Title:** "Dashboard"
- **Welcome Message:** "Welcome back, [User Name]"
- **Stats Cards (3 columns):**
  - **Users Card:**
    - Icon: Users icon
    - Number: Total user count
    - Label: "Total users"
  - **House Builders Card:**
    - Icon: Building2 icon
    - Number: Total builder count
    - Label: "Total builders"
  - **Blog Posts Card:**
    - Icon: FileText icon
    - Number: Total blog post count
    - Label: "Total posts"

**Styling:**
- Cards have white background with subtle borders
- Icons are muted gray
- Numbers are large and bold
- Dark mode support throughout

---

## 3. Users Management Page (`/admin/users`)

**Layout:**
- Same sidebar as dashboard
- Main content area with user management interface

**Header Section:**
- **Title:** "User Management" (large, bold)
- **Description:** "Manage user accounts and privileges"
- **Add User Button:** Blue button with "+" icon and "Add User" text

**Users Table:**
- **Columns:**
  1. Email
  2. Name
  3. Role (with colored badges)
  4. Created (date)
  5. Actions (Edit & Delete buttons)

**Role Badges:**
- **Administrator:** Purple background (purple-100/purple-800)
- **Content Manager:** Blue background (blue-100/blue-800)

**Action Buttons:**
- **Edit:** Outline button with edit icon
- **Delete:** Outline button with trash icon (disabled for current user)

**Dialogs:**

### Create User Dialog:
- **Title:** "Create New User"
- **Description:** "Add a new user to the system"
- **Fields:**
  - Email (required)
  - Password (required)
  - Name (optional)
  - Role (dropdown: Administrator/Content Manager)
- **Buttons:** Cancel (outline) and Create (primary)

### Edit User Dialog:
- **Title:** "Edit User"
- **Description:** "Update user information"
- **Fields:**
  - Email
  - Password (optional - "leave blank to keep current")
  - Name
  - Role (dropdown)
- **Buttons:** Cancel and Update

### Delete Confirmation Dialog:
- **Title:** "Are you sure?"
- **Description:** "This will permanently delete this user account."
- **Buttons:** Cancel and Delete (destructive action)

**Features:**
- Toast notifications for all actions (success/error)
- Form validation
- Prevents deleting your own account
- Only Administrators can access this page

---

## 4. Design System

**Colors:**
- Primary: Blue tones
- Success: Green (toasts)
- Error: Red (toasts)
- Background: Light gray (light mode) / Dark gray (dark mode)
- Cards: White (light) / Dark gray-800 (dark)

**Typography:**
- Headings: Bold, large
- Body: Regular weight
- Labels: Medium weight
- Muted text: Gray-600/Gray-400

**Components:**
- shadcn/ui components throughout
- Consistent spacing and padding
- Rounded corners on cards and buttons
- Subtle shadows and borders
- Smooth transitions on hover states

**Responsive:**
- Mobile-friendly layout
- Sidebar collapses on smaller screens
- Grid layouts adapt to screen size

---

## 5. User Experience Flow

1. **Login:**
   - User enters credentials
   - Toast notification on success/error
   - Redirects to dashboard

2. **Navigation:**
   - Click sidebar items to navigate
   - Active page highlighted in blue
   - Smooth transitions

3. **User Management:**
   - Click "Add User" → Dialog opens
   - Fill form → Click "Create" → Toast notification → Table refreshes
   - Click Edit icon → Dialog opens with pre-filled data
   - Make changes → Click "Update" → Toast notification → Table refreshes
   - Click Delete icon → Confirmation dialog → Confirm → Toast → Table refreshes

---

## 6. Accessibility Features

- Proper ARIA labels
- Keyboard navigation support
- Focus states on interactive elements
- Screen reader friendly
- High contrast in dark mode

---

## Visual Mockup Description

**Overall Feel:**
- Clean, professional, modern
- Similar to Vercel's dashboard or Linear's interface
- Minimalist with focus on functionality
- Consistent spacing and alignment
- Professional color scheme

**Key Visual Elements:**
- Sidebar: Fixed left, dark border, icons + text
- Content: White/dark cards with subtle shadows
- Tables: Clean borders, alternating row colors (subtle)
- Buttons: Clear hierarchy (primary, outline, destructive)
- Forms: Well-spaced inputs with clear labels
- Dialogs: Centered modals with backdrop blur

---

## Screenshots Location

- Login page: `login-page.png` (captured)

To see the full interface:
1. Ensure admin user exists in database
2. Navigate to `/admin/login`
3. Log in with admin credentials
4. Explore the dashboard and user management pages

