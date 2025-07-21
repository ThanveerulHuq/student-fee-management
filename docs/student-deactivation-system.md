# Student Deactivation & Management System

## 📋 Overview
This document outlines the implementation plan for a comprehensive student deletion/deactivation system that includes soft deletion, reactivation, and proper management of inactive students while maintaining data integrity.

## 🎯 Current State Analysis
- ✅ Basic soft delete exists (sets `isActive: false`)
- ✅ Student has related data: enrollments, documents, fee transactions
- ❌ No bulk operations support
- ❌ No reactivation functionality
- ❌ No inactive student listing
- ❌ No deletion validation for related records
- ❌ No UI components for these operations

---

## 🚀 HIGH PRIORITY TASKS (Immediate Implementation)

### Task 1: Enhanced Individual Student Deactivation API
**Priority:** HIGH  
**Estimate:** 4 hours

#### API Endpoint: `POST /api/students/[id]/deactivate`

```typescript
interface DeactivateRequest {
  reason?: string  // Optional deactivation reason
}

interface DeactivateResponse {
  success: boolean
  student: Student
  message: string
}
```

#### Implementation Details:
- Update existing DELETE endpoint to use enhanced deactivation
- Add optional reason tracking
- **Do NOT deactivate enrollments** - keep them active for historical data
- Return success response with updated student
- Add validation to prevent deactivation conflicts

#### Business Rules:
- ✅ Soft delete only (preserve all data)
- ✅ **Keep enrollments active** - only deactivate the student record
- ✅ Maintain fee transaction history
- ✅ Allow deactivation even with pending fees (with warning)

---

### Task 2: Student Reactivation API
**Priority:** HIGH  
**Estimate:** 3 hours

#### API Endpoint: `POST /api/students/[id]/reactivate`

```typescript
interface ReactivateRequest {
  restoreEnrollments?: boolean
  academicYearId?: string
  classId?: string
}

interface ReactivateResponse {
  success: boolean
  student: Student
  conflicts?: string[]
  message: string
}
```

#### Implementation Details:
- New API endpoint for reactivating students
- Check for conflicts (duplicate admission numbers)
- Option to restore previous enrollments
- Option to create new enrollment for current academic year

#### Validation Rules:
- ✅ Verify student exists and is inactive
- ✅ Check admission number uniqueness
- ✅ Validate academic year and class if provided
- ✅ Handle enrollment restoration logic

---

### Task 3: Inactive Students Listing API
**Priority:** HIGH  
**Estimate:** 2 hours

#### API Endpoint: `GET /api/students/inactive`

```typescript
interface InactiveStudentsQuery {
  page?: number
  limit?: number
  search?: string
  deactivatedAfter?: string
  deactivatedBefore?: string
  reason?: string
}

interface InactiveStudentsResponse {
  students: Student[]
  pagination: PaginationInfo
}
```

#### Implementation Details:
- Filter students where `isActive = false`
- Support search across name, admission number
- Add date range filtering for deactivation date
- Include deactivation reason in response
- Support pagination

---

### Task 4: Enhanced Student List UI with Status Management
**Priority:** HIGH  
**Estimate:** 6 hours

#### Components to Create/Update:

```tsx
// 1. StudentStatusBadge Component
interface StudentStatusBadgeProps {
  student: Student
  showDeactivationInfo?: boolean
}

// 2. StudentActionMenu Component
interface StudentActionMenuProps {
  student: Student
  onDeactivate: () => void
  onReactivate: () => void
  onEdit: () => void
  onView: () => void
}

// 3. StatusFilter Component
interface StatusFilterProps {
  value: 'all' | 'active' | 'inactive'
  onChange: (value: string) => void
}
```

#### Design Specifications:
- **Active Badge**: Green badge with "Active" text
- **Inactive Badge**: Gray badge with "Inactive" text + optional reason tooltip
- **Action Menu**: Dropdown with contextual actions based on student status
- **Status Filter**: Pills/tabs above student list for filtering

#### UI Updates Needed:
- Update `src/app/(authenticated)/students/page.tsx` to include status filter
- Add status column to students table
- Add action menu to each student row
- Update search to work with inactive students

---

### Task 5: Deactivation & Reactivation Dialogs
**Priority:** HIGH  
**Estimate:** 4 hours

#### Components to Create:

```tsx
// 1. DeactivateStudentDialog
interface DeactivateStudentDialogProps {
  student: Student
  isOpen: boolean
  onConfirm: (data: DeactivateRequest) => void
  onCancel: () => void
}

// 2. ReactivateStudentDialog  
interface ReactivateStudentDialogProps {
  student: Student
  isOpen: boolean
  onConfirm: (data: ReactivateRequest) => void
  onCancel: () => void
}
```

#### Design Details:

**Deactivate Dialog:**
- Student name and admission number display
- Optional reason selection (dropdown + custom option)
- Information note: "Enrollments will remain active for historical data"
- Warning about student becoming inactive but preserving academic records
- Red "Deactivate" button + Cancel button

**Reactivate Dialog:**
- Student name and current status display
- Checkbox: "Restore previous enrollments"
- Academic year and class selection for new enrollment
- Conflict warnings if any
- Green "Reactivate" button + Cancel button

#### Reason Options:
- Transferred to Another School
- Graduated
- Disciplinary Action
- Financial Issues
- Medical Leave
- Other (with text input)

---

### Task 6: Inactive Students Management Page
**Priority:** HIGH  
**Estimate:** 5 hours

#### New Page: `/students/inactive`

#### Features:
- List all inactive students with pagination
- Search functionality (name, admission number)
- Filter by deactivation reason
- Filter by deactivation date range
- Bulk reactivation functionality
- Individual reactivation actions

#### Components:
```tsx
// InactiveStudentsPage Component
interface InactiveStudentsPageProps {}

// InactiveStudentCard Component
interface InactiveStudentCardProps {
  student: Student
  onReactivate: () => void
}

// DeactivationFilters Component
interface DeactivationFiltersProps {
  filters: InactiveFilters
  onChange: (filters: InactiveFilters) => void
}
```

#### Navigation:
- Add link in main navigation sidebar
- Add link in students page header
- Badge showing count of inactive students

---

## 📋 MEDIUM PRIORITY TASKS (Future Sprint)

### Task 7: Bulk Operations API
**Priority:** MEDIUM  
**Estimate:** 6 hours

#### API Endpoint: `POST /api/students/bulk-operations`
- Support bulk deactivate/reactivate
- Batch processing with error handling
- Progress tracking for large operations

### Task 8: Database Schema Enhancement for Audit Trail
**Priority:** MEDIUM  
**Estimate:** 4 hours

#### Schema Updates:
```prisma
model Student {
  // Add deactivation tracking fields
  deactivatedAt      DateTime?
  deactivatedBy      String?
  deactivationReason String?
  reactivatedAt      DateTime?
  reactivatedBy      String?
  
  statusHistory StudentStatusHistory[]
}

model StudentStatusHistory {
  id          String        @id @default(auto()) @map("_id") @db.ObjectId
  studentId   String        @db.ObjectId
  action      StudentAction
  reason      String?
  performedBy String
  performedAt DateTime      @default(now())
  
  student Student @relation(fields: [studentId], references: [id])
  
  @@map("student_status_history")
}

enum StudentAction {
  DEACTIVATED
  REACTIVATED
  HARD_DELETED
}
```

### Task 9: Advanced Filtering and Search
**Priority:** MEDIUM  
**Estimate:** 3 hours

- Date range filtering for deactivation
- Multi-select reason filtering
- Advanced search with multiple criteria
- Export functionality for inactive students

### Task 10: Bulk Selection UI Components
**Priority:** MEDIUM  
**Estimate:** 4 hours

- Checkbox selection for student rows
- Bulk action toolbar
- Select all/none functionality
- Progress indicators for bulk operations

---

## 📦 LOW PRIORITY TASKS (Future Requirements)

### Task 11: Hard Delete Functionality (Admin Only)
**Priority:** LOW  
**Estimate:** 8 hours

#### Features:
- Admin-only hard delete capability
- Cascade validation (cannot delete if has fee transactions)
- Archive critical data before deletion
- Confirmation with admin password

### Task 12: Automated Deactivation Rules
**Priority:** LOW  
**Estimate:** 6 hours

#### Features:
- Auto-deactivate students without enrollment for X months
- Graduation-based auto-deactivation
- Configurable rules engine

### Task 13: Notification System
**Priority:** LOW  
**Estimate:** 4 hours

#### Features:
- Email notifications to parents on deactivation
- SMS notifications for status changes
- Internal notifications for staff

### Task 14: Analytics and Reporting
**Priority:** LOW  
**Estimate:** 5 hours

#### Features:
- Student status analytics dashboard
- Deactivation trends and reports
- Graduation tracking reports
- Retention analytics

### Task 15: Integration with External Systems
**Priority:** LOW  
**Estimate:** 8 hours

#### Features:
- Sync with government education databases
- Integration with transport management
- Library system integration

---

## 🔒 Security & Permission Requirements

### Role-Based Access Control:
- **STAFF**: Can deactivate/reactivate students
- **ADMIN**: All student management operations + bulk operations
- **VIEW_ONLY**: Can view status but cannot modify

### Validation Requirements:
- ✅ Reason is optional for deactivation
- ✅ Cannot reactivate with duplicate admission numbers
- ✅ Audit trail for all status changes
- ✅ User session validation for all operations

---

## 🎨 UI/UX Design Guidelines

### Color Scheme:
- **Active Status**: Green (#10B981)
- **Inactive Status**: Gray (#6B7280)
- **Deactivate Action**: Red (#EF4444)
- **Reactivate Action**: Blue (#3B82F6)

### Icons:
- **Active**: CheckCircle
- **Inactive**: XCircle or Pause
- **Deactivate**: UserMinus
- **Reactivate**: UserPlus

### Interaction Patterns:
- Confirmation dialogs for destructive actions
- Loading states for async operations
- Toast notifications for success/error feedback
- Tooltips for status information

---

## 📋 Testing Requirements

### Unit Tests:
- API endpoint functionality
- Business logic validation
- Database operations

### Integration Tests:
- End-to-end deactivation flow
- Reactivation with enrollment restoration
- Bulk operations

### UI Tests:
- Dialog interactions
- Filter functionality
- Status badge display

---

## 📝 Documentation Requirements

### API Documentation:
- Endpoint specifications
- Request/response examples
- Error codes and messages

### User Documentation:
- How to deactivate/reactivate students
- Understanding student status
- Bulk operations guide

### Technical Documentation:
- Database schema changes
- Component architecture
- Security considerations

---

## 🚀 Implementation Order

1. **Week 1**: Tasks 1-2 (API endpoints)
2. **Week 2**: Tasks 3-4 (Listing API + UI updates)
3. **Week 3**: Tasks 5-6 (Dialogs + Inactive students page)

This implementation plan provides a complete student deactivation system while maintaining data integrity and providing excellent user experience.