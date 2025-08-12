# Data Migration Guide

This guide explains how to migrate data from the old MySQL-based BlueMoon SDMS system to the new MongoDB-based Next.js application.

## 📋 Prerequisites

Before starting the migration, ensure you have:

1. **CSV Data Files**: All required CSV files exported from the old MySQL database and placed in `data/2025/` directory
2. **Dependencies Installed**: Run `npm install` to install all required packages including `csv-parse`
3. **MongoDB Running**: Ensure your MongoDB instance is running and accessible via the `DATABASE_URL` environment variable
4. **Environment Variables**: Configure `.env.local` with proper database connection string

## 📁 Required CSV Files

The migration expects the following CSV files in `data/2025/` directory:

- `academic_year.csv` - Academic year information
- `class_info.csv` - Class/grade information  
- `students_info.csv` - Student personal information
- `student_year.csv` - Student enrollment and fee information
- `fee_txn.csv` - Fee payment transaction records
- `paid_fee.csv` - Total paid fee amounts (optional, used for validation)
- `common_fee.csv` - Fee structures per class with school fee and book fee amounts

## 🔄 Migration Process

### Schema Transformation

The migration transforms the old relational schema to a new flexible, denormalized MongoDB schema:

#### Key Changes:

1. **Enhanced Student Model**:
   - Multiple mobile numbers with labels (Primary, Secondary, etc.)
   - WhatsApp flags for mobile numbers
   - Improved demographics and contact information

2. **Template-Based Fee System**:
   - Master fee templates with categories (REGULAR, OPTIONAL, etc.)
   - Master scholarship templates with types (MERIT, NEED_BASED, etc.)
   - Class-wise fee structures with embedded templates

3. **Denormalized Enrollments**:
   - Student enrollments with embedded student, academic year, and class info
   - Individual fee customization per student
   - Pre-computed totals for performance
   - Real-time fee status tracking

4. **Enhanced Payment System**:
   - Auto-generated receipt numbers per academic year
   - Detailed payment breakdowns
   - Payment method tracking
   - Embedded student information for receipts

### Data Mapping

| Old Schema | New Schema | Transformation |
|------------|------------|----------------|
| `academic_year.year` | `AcademicYear.year` | Direct mapping with date range calculation |
| `class_info.class_name` | `Class.className` | Direct mapping with ordering |
| `students_info.*` | `Student.*` | Enhanced with mobile number array |
| `common_fee` | `FeeStructure` | Template-based fee structures per class |
| `student_year + common_fee` | `StudentEnrollment` | Denormalized with computed totals |
| `fee_txn` | `Payment` | Enhanced with receipt generation |

## 🚀 Running the Migration

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Run the Migration

```bash
npm run migrate
```

The migration script will:

1. ✅ Migrate Academic Years (with calculated date ranges)
2. ✅ Migrate Classes (with proper ordering)
3. ✅ Create Default Fee Templates (School Fee, Book Fee, etc.)
4. ✅ Create Default Scholarship Templates (Merit, Need-based, etc.)
5. ✅ Migrate Students (with enhanced mobile number structure)
6. ✅ Create Fee Structures (denormalized with embedded templates)
7. ✅ Migrate Student Enrollments (with pre-computed totals)
8. ✅ Migrate Payments (with auto-generated receipt numbers)
9. ✅ Update Enrollment Totals (based on actual payments)
10. ✅ Create Default Admin User

### Step 4: Validate Migration

```bash
npm run validate-migration
```

This will:
- Compare record counts between CSV and database
- Check data integrity
- Generate financial summaries
- Identify any inconsistencies or missing data

## 🔐 Default Admin User

The migration creates a default admin user:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `ADMIN`

⚠️ **Important**: Change this password immediately after first login!

## 🏷️ Migration Tracking

Every migrated record includes a `migrationData` JSON field containing:

```typescript
{
  sourceTable: string,        // Original table name (e.g., "students_info", "student_year", "fee_txn")
  sourceId: string,          // Original record ID from old system
  migratedAt: string,        // ISO timestamp of migration
  migrationVersion: string,   // Migration script version
  migrationScript: string,   // Script name that performed migration
  // Additional table-specific data...
}
```

### Tracking Data Examples:

**Student Migration Data:**
```json
{
  "sourceTable": "students_info",
  "sourceId": "1443",
  "migratedAt": "2025-01-10T10:30:00.000Z",
  "migrationVersion": "1.0.0",
  "migrationScript": "migrate-data.ts",
  "originalAdmissionNo": "1875",
  "originalActive": "Y",
  "mobileNumbersCount": 2,
  "hasAadhar": false,
  "hasEmis": false
}
```

**Enrollment Migration Data:**
```json
{
  "sourceTable": "student_year",
  "sourceId": "1",
  "originalStudentId": "1443",
  "originalCommonFee": "8",
  "originalTotal": "40000",
  "originalScholarship": "0",
  "feeItemsCount": 5,
  "scholarshipItemsCount": 0,
  "netAmountDue": 35000,
  "hadScholarship": false
}
```

**Payment Migration Data:**
```json
{
  "sourceTable": "fee_txn",
  "sourceId": "1",
  "originalStudentYearId": "1",
  "originalAmountPaid": 10000,
  "feeBreakdown": {
    "schoolFee": 3000,
    "bookFee": 3500,
    "uniformFee": 3500,
    "islamicStudies": 0,
    "vanFee": 0
  },
  "paymentItemsCount": 3,
  "generatedReceiptNo": "20250001",
  "receiptSequence": 1
}
```

## 🔍 Migration Tracker Tool

Query migrated data using original IDs:

```bash
# Find student by original student_id
npm run migration-tracker find-student 1443

# Find enrollment by original student_year.id
npm run migration-tracker find-enrollment 1

# Find payment by original fee_txn.id
npm run migration-tracker find-payment 1

# Trace complete student journey
npm run migration-tracker trace-journey 1443

# Generate data quality report
npm run migration-tracker quality-report
```

## 📊 Migration Features

### 1. Smart Fee Mapping

The migration intelligently maps old fee categories to new template-based system:

```typescript
// Old system: Fixed fields
{
  school_fee: 15000,
  book_fee: 2500,
  uniform_fee: 3500,
  islamic_studies: 0,
  van_fee: 0
}

// New system: Template-based
{
  fees: [
    {
      templateName: "School Fee",
      templateCategory: "REGULAR",
      amount: 15000,
      isCompulsory: true
    },
    // ... other fees
  ]
}
```

### 2. Denormalized Performance

Critical data is denormalized for optimal query performance:

```typescript
// Student Enrollment with embedded data
{
  student: { name, admissionNumber, fatherName, ... },
  academicYear: { year, startDate, endDate, ... },
  class: { className, order, ... },
  fees: [ /* individual fee items */ ],
  scholarships: [ /* applied scholarships */ ],
  totals: {
    fees: { total, paid, due },
    scholarships: { applied },
    netAmount: { total, paid, due }
  }
}
```

### 3. Receipt Generation

Automatic receipt number generation per academic year:

```typescript
// Receipt format: YYYY#### (e.g., 20250001, 20250002, ...)
const receiptNo = `${academicYear.year.split('-')[0]}${sequence.padStart(4, '0')}`;
```

## 🔧 Customization

### Adding Custom Fee Templates

To add custom fee templates, modify the `createDefaultFeeTemplates()` function:

```typescript
const customFeeTemplates = [
  { name: 'Lab Fee', category: 'OPTIONAL', order: 6 },
  { name: 'Sports Fee', category: 'ACTIVITY', order: 7 },
  // ... add more templates
];
```

### Modifying Class-wise Fee Amounts

Update the `getDefaultFeeAmount()` function to set class-specific fee amounts:

```typescript
const feeMap = {
  'School Fee': {
    'L.K.G': 15000,
    'U.K.G': 15000,
    '1': 16000,
    // ... customize amounts per class
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **CSV Format Issues**:
   - Ensure CSV files have proper headers
   - Check for special characters or encoding issues
   - Verify date formats are consistent

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` in `.env.local`
   - Ensure MongoDB is running and accessible
   - Check network connectivity

3. **Missing Dependencies**:
   ```bash
   npm install csv-parse tsx
   ```

4. **Prisma Client Issues**:
   ```bash
   npx prisma generate --schema=prisma/schema.prisma
   ```

### Data Validation Failures

If validation fails:

1. Review the validation report for specific errors
2. Check CSV data for inconsistencies
3. Manually fix data issues in CSV files
4. Re-run migration if necessary

### Manual Data Fixes

For minor data inconsistencies:

1. Use Prisma Studio: `npx prisma studio`
2. Access the admin panel in the application
3. Use MongoDB Compass for direct database access

## 📈 Performance Considerations

The new schema is optimized for:

1. **Fast Student Lookups**: Denormalized enrollment data
2. **Quick Financial Reports**: Pre-computed totals
3. **Efficient Receipt Generation**: Embedded payment details
4. **Real-time Fee Status**: Computed fee status tracking

## 🔒 Security Notes

1. **Change Default Passwords**: Immediately update the default admin password
2. **Environment Variables**: Keep database credentials secure
3. **Access Control**: The new system has role-based access (ADMIN/STAFF)
4. **Data Validation**: All inputs are validated using Zod schemas

## 📝 Post-Migration Tasks

After successful migration:

1. ✅ Change default admin password
2. ✅ Test key application features
3. ✅ Verify financial calculations
4. ✅ Check receipt generation
5. ✅ Test fee collection workflow
6. ✅ Validate user permissions
7. ✅ Setup regular database backups

## 🆘 Support

If you encounter issues during migration:

1. Check the validation report for detailed error information
2. Review this documentation for troubleshooting steps
3. Examine the migration logs for specific error messages
4. Verify CSV data integrity and format

## 📄 Migration Log Example

```
🚀 Starting data migration...
📊 Loading CSV data...
✅ CSV data loaded
🔄 Migrating Academic Years...
✅ Academic Years migrated
🔄 Migrating Classes...
✅ Classes migrated
🔄 Creating default fee templates...
✅ Fee templates created
🔄 Creating default scholarship templates...
✅ Scholarship templates created
🔄 Migrating Students...
✅ Students migrated
🔄 Creating Fee Structures...
✅ Fee Structures created
🔄 Migrating Student Enrollments...
✅ Student Enrollments migrated
🔄 Migrating Payments...
✅ Payments migrated
🔄 Updating enrollment totals...
✅ Enrollment totals updated
🔄 Creating default admin user...
✅ Default admin user created

🎉 Migration completed successfully!

📋 Summary:
   Academic Years: 1
   Classes: 18
   Students: 150
   Student Enrollments: 150
   Fee Transactions: 250
```