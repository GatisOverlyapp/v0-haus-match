# CMS Setup Guide

## Overview

This CMS (Content Management System) allows you to manage:
1. **User Accounts** - Create and manage users with different roles (Administrator, Content Manager)
2. **House Builder Profiles** - Manage prefab house builder profiles with images, descriptions, and house listings
3. **Blog Posts** - Create and manage blog articles

## Initial Setup

### 1. Database Setup

The database is already configured with SQLite. The database file is located at `prisma/dev.db`.

### 2. Create Admin User

To create the initial admin user, you have two options:

#### Option A: Using Prisma Studio (Recommended)
1. Run: `npm run db:studio`
2. Open the Prisma Studio interface in your browser
3. Navigate to the `User` model
4. Click "Add record"
5. Fill in:
   - Email: `admin@hausmatch.com` (or your preferred email)
   - Password: Use a password hasher (bcrypt) or use the API endpoint below
   - Name: `Administrator` (optional)
   - Role: `ADMINISTRATOR`

#### Option B: Using SQL
You can manually insert a user using SQL. The password needs to be hashed with bcrypt.

#### Option C: Create via API (After first login)
Once you have one admin user, you can create additional users through the admin panel.

### 3. Environment Variables

Make sure your `.env` file contains:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Access the CMS

Navigate to: `http://localhost:3000/admin/login`

## User Roles

### Administrator
- Full access to all features
- Can create, edit, and delete users
- Can manage all content (builders, houses, blog posts)

### Content Manager
- Can manage content (builders, houses, blog posts)
- Cannot create, edit, or delete users
- Cannot access user management section

## Features

### User Management (`/admin/users`)
- Create new users with email, password, name, and role
- Edit existing users
- Delete users (cannot delete your own account)
- View all users in a table

### House Builder Management (`/admin/builders`)
- Create builder profiles with:
  - Name
  - Website URL (opens in new tab)
  - Location
  - Main image
  - Description
- Edit and delete builders
- View associated houses for each builder

### House Management (via Builder)
- For each builder, you can add houses with:
  - Name and description
  - Size, price, materials
  - Number of stories, bedrooms, bathrooms
  - Square footage
  - AR model URL (for AR feature)
  - Image gallery
  - Subcategories with images

### Blog Management (`/admin/blog`)
- Create blog posts with:
  - Title and slug (auto-generated from title)
  - Content (full text)
  - Excerpt
  - Featured image
  - Published status
- Edit and delete posts
- View published/draft status

## API Endpoints

All API endpoints are protected and require authentication:

- `GET /api/admin/users` - List all users (Admin only)
- `POST /api/admin/users` - Create user (Admin only)
- `PUT /api/admin/users/[id]` - Update user (Admin only)
- `DELETE /api/admin/users/[id]` - Delete user (Admin only)

- `GET /api/admin/builders` - List all builders
- `POST /api/admin/builders` - Create builder
- `PUT /api/admin/builders/[id]` - Update builder
- `DELETE /api/admin/builders/[id]` - Delete builder

- `GET /api/admin/houses` - List all houses
- `POST /api/admin/houses` - Create house
- `PUT /api/admin/houses/[id]` - Update house
- `DELETE /api/admin/houses/[id]` - Delete house

- `GET /api/admin/blog` - List all blog posts
- `POST /api/admin/blog` - Create blog post
- `PUT /api/admin/blog/[id]` - Update blog post
- `DELETE /api/admin/blog/[id]` - Delete blog post

## Database Schema

The database includes the following models:
- `User` - User accounts with roles
- `HouseBuilder` - Builder profiles
- `House` - Individual house listings
- `HouseImage` - Images for houses
- `HouseSubcategory` - Subcategories for houses
- `BlogPost` - Blog articles

## Security Notes

- All admin routes are protected by authentication middleware
- Passwords are hashed using bcrypt
- Role-based access control is enforced at both UI and API levels
- Change the `NEXTAUTH_SECRET` in production
- Use a strong password for the admin account

## Troubleshooting

### Cannot login
- Make sure you've created an admin user
- Check that the database file exists (`prisma/dev.db`)
- Verify environment variables are set correctly

### Database errors
- Run `npm run db:generate` to regenerate Prisma client
- Run `npm run db:migrate` to apply any pending migrations

### Build errors
- Make sure all dependencies are installed: `npm install`
- Check that Prisma client is generated: `npm run db:generate`










