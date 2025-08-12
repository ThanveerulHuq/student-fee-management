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
- **API Routes** (`api/`): RESTful endpoints for students, fees, reports, authentication, academic years
- **Pages**: Dashboard, students, fees, reports, authentication, admin panel with nested layouts
- **Admin Panel** (`admin/`): User management, academic years, fee templates, scholarship templates, fee structures
- **Middleware**: NextAuth.js authentication middleware protecting routes

**Key Components**:
- **Database Models** (`prisma/schema.prisma`): Student, User, AcademicYear, Class, FeeTemplate, ScholarshipTemplate, FeeStructure, StudentEnrollment, Payment
- **Authentication** (`src/lib/auth.ts`): NextAuth configuration with bcrypt password hashing
- **Database Client** (`src/lib/prisma.ts`): Prisma client with connection pooling
- **Validations** (`src/lib/validations/`): Zod schemas for form validation
- **UI Components** (`src/components/ui/`): Reusable shadcn/ui components
- **Receipt System** (`src/components/receipts/`): Template-based receipt generation with multiple formats

## Database Schema

**Core Models**:
- `User`: System users with roles (ADMIN, STAFF)
- `Student`: Student information with admission details, demographics, contact info, documents
- `AcademicYear`: Academic year management with date ranges and active status
- `Class`: Grade levels with ordering and active status
- `FeeTemplate`: Master fee templates with categories (REGULAR, OPTIONAL, ACTIVITY, EXAMINATION, LATE_FEE)
- `ScholarshipTemplate`: Master scholarship templates with types (MERIT, NEED_BASED, GOVERNMENT, SPORTS, MINORITY, GENERAL)
- `FeeStructure`: Denormalized fee structures per academic year and class with embedded templates and computed totals
- `StudentEnrollment`: Highly denormalized student enrollments with individualized fees, scholarships, and pre-computed totals
- `Payment`: Payment records with embedded student info and payment breakdowns
- `Document`: Student document management with Cloudinary integration
- `ReceiptSequence`: Auto-incrementing receipt number generation per academic year

**Key Design Features**:
- **Denormalization Strategy**: Heavy use of embedded documents and computed totals for performance
- **Composite Types**: Rich embedded types like `StudentInfo`, `AcademicYearInfo`, `ClassInfo`, `FeeItem`, `ScholarshipItem`
- **Pre-computed Totals**: `FeeTotals`, `ScholarshipTotals`, `StudentTotals` for fast queries
- **Flexible Fee System**: Individual fee customization per student enrollment
- **Status Tracking**: Comprehensive status enums for students, fees, and payments

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
npx prisma generate     # Generate Prisma client to src/generated/prisma/
npx prisma db push      # Push schema changes to MongoDB
npx prisma studio       # Open Prisma Studio
npx prisma db seed      # Run seed script (prisma/seed.ts)
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
- Protected routes via middleware for `/dashboard`, `/students`, `/fees`, `/reports`, `/admin`
- User roles: ADMIN, STAFF
- Admin-only routes: `/admin/*` (user management, academic years, templates, fee structures)

**Code Generation**:
- Prisma client auto-generated to `src/generated/prisma/`
- ESLint ignores generated files
- TypeScript paths configured for `@/*` imports
- Components used only in specific pages should be created in `_components` folder in the same directory
- Components reused across multiple pages should be put in `src/components/`
- Do not auto build after changes, ask user to build the project

**Payment System**:
- Template-based fee structures with individualized customizations
- Denormalized enrollment records with pre-computed totals
- Comprehensive payment tracking with receipt generation
- Multiple payment methods: CASH, ONLINE, CHEQUE
- Auto-incrementing receipt numbers per academic year

**Key Features**:
- Student management with comprehensive enrollment tracking
- Flexible fee collection system with scholarship support
- Template-based fee and scholarship management
- Real-time analytics and dashboard
- Document management with Cloudinary integration
- Admin panel with user management, templates, fee structures
- Multi-format receipt generation (Formal, Islamic, Modern templates)

## API Structure

**Academic Years API** (`/api/academic-years`):
- `GET /api/academic-years` - List all academic years with optional active filter
- `POST /api/academic-years` - Create new academic year
- `GET /api/academic-years/[id]` - Get single academic year details
- `PUT /api/academic-years/[id]` - Update academic year (auto-deactivates others if set active)
- `DELETE /api/academic-years/[id]` - Delete academic year (protected if has associated records)

**Students API** (`/api/students`):
- `GET /api/students` - List students with search, pagination, status filtering
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student information
- `POST /api/students/[id]/deactivate` - Deactivate student
- `POST /api/students/[id]/reactivate` - Reactivate student

**Enrollments API** (`/api/enrollments`):
- `GET /api/enrollments` - List enrollments with filters
- `POST /api/enrollments` - Create student enrollment
- `GET /api/enrollments/[id]` - Get enrollment details
- `PUT /api/enrollments/[id]` - Update enrollment with individualized fees/scholarships

**Payments API** (`/api/payments`):
- `POST /api/fees/collect` - Process fee payment with receipt generation
- `GET /api/payments/[id]` - Get payment details

**Admin APIs** (`/api/admin/`):
- **Users**: User management with role-based access
- **Fee Templates**: Master fee template CRUD operations
- **Scholarship Templates**: Master scholarship template CRUD operations
- **Fee Structures**: Fee structure management with template embedding
- Role-based access control (ADMIN only)

## Form Validation

**Academic Year Validation** (`src/lib/validations/academic-year.ts`):
- Year format: YYYY-YY (e.g., "2024-25")
- Date range validation (start date < end date)
- Unique year constraint
- Optional description field

**Student Validation** (`src/lib/validations/student.ts`):
- Multi-step form validation with comprehensive demographics
- Mobile number validation with WhatsApp and primary flags
- Document management validation

**Enrollment Validation** (`src/lib/validations/enrollment.ts`):
- Flexible enrollment with individualized fee and scholarship customization
- Pre-computed totals validation

**Fee Structure Validation** (`src/lib/validations/fee-structure.ts`):
- Template-based fee structure with embedded data validation
- Computed totals consistency checks

**UI Standards**
- Always use loading skeleton while loading data
- Use `loading.tsx` page in the directory if whole page is being loaded and there is no meaningful data to be shown
- Make the components as modular as possible for better readability
- Admin pages follow consistent card-based layout with expand/collapse functionality
- Sheet-based forms for add/edit operations with proper validation
- Receipt templates support multiple formats (Formal, Islamic, Modern) with school branding

**Coding Standards**
- Do not name the components/apis based on the current modification
- Follow the denormalization strategy for performance-critical operations
- Use embedded documents and pre-computed totals where appropriate
- Maintain data consistency between normalized masters and denormalized documents 

- Do not build the project unless specifically asked. ask the user to build it. I have the dev server running already