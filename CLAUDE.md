# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 student fee management system for "BlueMoon" school. The application manages student information, fee collection, enrollments, and academic records with authentication.

**Tech Stack**:
- **Framework**: Next.js 15 with App Router, TypeScript, React 19
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Hook Form with Zod validation

## Architecture

**App Router Structure** (`src/app/`):
- **API Routes** (`api/`): RESTful endpoints for students, fees, reports, authentication
- **Pages**: Dashboard, students, fees, reports, authentication with nested layouts
- **Middleware**: NextAuth.js authentication middleware protecting routes

**Key Components**:
- **Database Models** (`prisma/schema.prisma`): Student, User, AcademicYear, Class, FeeTxn, PaidFee
- **Authentication** (`src/lib/auth.ts`): NextAuth configuration with bcrypt password hashing
- **Database Client** (`src/lib/prisma.ts`): Prisma client with connection pooling
- **Validations** (`src/lib/validations/`): Zod schemas for form validation
- **UI Components** (`src/components/ui/`): Reusable shadcn/ui components

## Database Schema

**Core Models**:
- `Student`: Student information with admission details, demographics, contact info
- `AcademicYear`: Academic year management with date ranges
- `Class`: Grade levels with ordering
- `StudentYear`: Student enrollment per academic year with individual fee customizations
- `FeeTxn`: Fee payment transactions with detailed breakdown
- `PaidFee`: Cumulative payment tracking per student-year
- `CommonFee`: Base fee structure per class and academic year
- `User`: System users with roles (ADMIN, STAFF)

## Common Commands

**Development**:
```bash
npm run dev --turbopack  # Run development server with Turbopack
npm run build            # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
```

**Database**:
```bash
npx prisma generate     # Generate Prisma client (runs automatically after install)
npx prisma db push      # Push schema changes to database
npx prisma studio       # Open Prisma Studio
```

**Type Checking**:
```bash
npx tsc --noEmit       # Type check without emitting files
```

## Development Notes

**Database Configuration**:
- Uses MongoDB with Prisma ORM
- Prisma client generated to `src/generated/prisma/` 
- Connection configured via `DATABASE_URL` environment variable
- Custom client output path configured in schema

**Authentication**:
- NextAuth.js with credentials provider
- JWT strategy with role-based access
- Protected routes via middleware for `/dashboard`, `/students`, `/fees`, `/reports`
- User roles: ADMIN, STAFF

**Code Generation**:
- Prisma client auto-generated to `src/generated/prisma/`
- ESLint ignores generated files
- TypeScript paths configured for `@/*` imports

**Payment System**:
- Supports multiple fee types: school, book, uniform, Islamic studies, van fees
- Individual fee customizations per student enrollment
- Cumulative payment tracking with detailed transaction history
- Receipt generation system

**Key Features**:
- Student management with enrollment tracking
- Fee collection with multiple payment methods
- Academic year and class management
- Comprehensive reporting system
- Document management for students