# Payment Migration Scripts

These scripts migrate existing Payment records to include the new fields: `academicYearId`, `class` (ClassInfo), and `section`.

## Files

1. **migrate-payments.js** - MongoDB shell script
2. **migrate-payments.ts** - TypeScript/Node.js script  
3. **README-migration.md** - This documentation

## Before Migration

Ensure you have:
1. A backup of your database
2. The updated Prisma schema deployed
3. Access to your MongoDB instance

## Migration Options

### Option 1: MongoDB Shell Script

**Best for:** Direct MongoDB shell access

```bash
# Connect to your MongoDB instance
mongosh "mongodb://localhost:27017/your_database_name"

# Copy and paste the contents of migrate-payments.js
# Or load the file:
load('scripts/migrate-payments.js')
```

### Option 2: TypeScript/Node.js Script

**Best for:** Node.js environment with Prisma

```bash
# Make sure you have tsx installed
npm install -g tsx

# Run the migration
npx tsx scripts/migrate-payments.ts

# Or with ts-node
npx ts-node scripts/migrate-payments.ts
```

## What the Migration Does

For each existing Payment record missing the new fields, the script:

1. Finds the associated `StudentEnrollment` record
2. Extracts `academicYearId`, `class`, and `section` from the enrollment
3. Updates the Payment record with:
   - `academicYearId`: String field from enrollment
   - `class`: ClassInfo object with `className` and `isActive` 
   - `section`: String field from enrollment

## Migration Process

1. **Counts** payments needing migration
2. **Processes** each payment individually
3. **Updates** payment records with enrollment data
4. **Verifies** migration completion
5. **Reports** success/error statistics
6. **Shows** a sample migrated record

## Expected Output

```
=== Payment Migration Script ===
Checking existing payments...
Found 150 payments that need migration
Starting migration process...
Migrated 10 payments...
Migrated 20 payments...
...
=== Migration Complete ===
Successfully migrated: 150 payments
Errors encountered: 0 payments
=== Verification ===
Payments still needing migration: 0
✅ All payments have been successfully migrated!
```

## Rollback Plan

If you need to rollback the migration:

```javascript
// MongoDB shell command to remove the new fields
db.payments.updateMany(
  {},
  { 
    $unset: { 
      academicYearId: "",
      class: "",
      section: ""
    }
  }
)
```

## Troubleshooting

**Missing Enrollments**: If the script reports missing enrollments, check:
- Payment records might reference deleted enrollments
- Enrollment IDs might be incorrect

**Permission Issues**: Ensure your MongoDB user has read/write permissions

**Schema Issues**: Verify the Prisma schema is properly deployed

## Post-Migration

After successful migration:

1. Verify the new fields are populated correctly
2. Test the fee collection API with new payments
3. Check receipt generation includes class and section data
4. Remove these migration scripts if no longer needed