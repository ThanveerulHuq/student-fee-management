# Reporting System Requirements

## Overview
The BlueMoon School Management System requires a simplified reporting system with two essential reports for fee management and tracking.

## Report Requirements

### 1. Outstanding Fees Report
**File**: `/reports/outstanding-fees`
**Purpose**: Display all students with pending/outstanding fees
**Target Users**: Administration, Fee Collection Staff

#### Features:
- **Student Information Display**:
  - Student name and admission number
  - Father's name and contact details
  - Current class and section
  - Academic year

- **Fee Details**:
  - Total fee amount due
  - Total amount paid to date
  - Outstanding balance (calculated)
  - Fee breakdown (School, Book, Uniform, Islamic Studies, Van fees)

- **Filtering Options**:
  - Academic Year filter
  - Class filter
  - Section filter
  - Minimum outstanding amount filter

- **Export Functionality**:
  - CSV export with all student and fee details
  - Include contact information for follow-up

- **Sorting**:
  - Default sort by highest outstanding amount
  - Secondary sort by student name

### 2. Fee Collection Report
**File**: `/reports/fee-collections`
**Purpose**: Track and analyze fee payments with detailed filtering
**Target Users**: Administration, Accountants, Fee Collection Staff

#### Features:
- **Transaction Information Display**:
  - Receipt number and payment date
  - Student name and admission number
  - Amount collected (total and breakdown)
  - Payment method (Cash/Online/Cheque)
  - Collector name (who processed the payment)

- **Filtering Options**:
  - **Date Range**: From date to To date (required)
  - **Collector Filter**: Filter by staff member who collected fees
  - **Payment Method**: Filter by Cash, Online, or Cheque
  - **Academic Year**: Optional filter
  - **Class**: Optional filter

- **Summary Statistics**:
  - Total amount collected in selected period
  - Number of transactions
  - Average transaction amount
  - Breakdown by payment method

- **Quick Date Filters**:
  - Today's collections
  - Last 7 days
  - Current month
  - Custom date range

- **Export Functionality**:
  - CSV export with all transaction details
  - Include summary statistics in export

## Navigation Structure

### Main Reports Page (`/reports`)
- Simple navigation with 2 report cards
- Quick access buttons for common date ranges
- Recent activity summary

### Report Pages
1. **Outstanding Fees** (`/reports/outstanding-fees`)
2. **Fee Collections** (`/reports/fee-collections`)

## Technical Requirements

### APIs to Use:
- `/api/reports/students` - For outstanding fees data
- `/api/reports/fee-collection` - For payment collection data
- `/api/academic-years` - For filter options
- `/api/classes` - For filter options

### Export Format:
- CSV files with proper headers
- Include summary information
- Filename format: `outstanding-fees-YYYY-MM-DD.csv`, `fee-collections-YYYY-MM-DD.csv`

### Performance:
- Load data on demand (not on page load)
- Show loading states during report generation
- Handle large datasets efficiently

### UI/UX:
- Consistent with existing application design
- Mobile-responsive tables
- Clear filter controls
- Prominent export buttons
- Error handling for failed requests

## Success Criteria
1. ✅ Administration can quickly identify students with outstanding fees
2. ✅ Staff can track daily/monthly fee collections
3. ✅ Reports can be exported for external use (Excel, printing)
4. ✅ Filtering is intuitive and covers common use cases
5. ✅ System performance remains good with large datasets
6. ✅ Mobile users can access and use reports effectively

## Recent Fixes
- ✅ **Date Validation Fixed**: All date fields now properly handle both string and Date object inputs with automatic conversion
- ✅ **Number Validation Fixed**: All numeric fields (fees, amounts) now accept both string and number inputs and convert properly
- ✅ **Fee Calculation Fixed**: Total fee calculation now uses proper number conversion to prevent string concatenation issues
- ✅ **Mixed Type Support**: Validation schemas now handle mixed input types (string/number/date) from different form submission methods
- ✅ **Select Component Fixed**: All Select components now use "NA" instead of empty strings for default values
- ✅ **TypeScript Improvements**: Added proper types for API routes and reduced lint errors
- ✅ **Lint Errors Fixed**: All TypeScript lint errors resolved, build now succeeds with 0 errors
- ✅ **Prisma Generated Files**: Excluded from linting to prevent thousands of generated file errors
- ✅ **Apostrophe Escaping**: Fixed all React JSX apostrophe escape issues

## Future Enhancements (Not in Scope)
- Advanced analytics and charts
- Automated report scheduling
- Email notifications for outstanding fees
- PDF report generation
- Multi-year comparative reports