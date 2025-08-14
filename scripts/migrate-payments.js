// MongoDB migration script to update existing payments with ClassInfo, section, and academicYearId
// Run this script in MongoDB shell or MongoDB Compass

// This script migrates existing Payment records to include:
// 1. academicYearId field
// 2. class field (ClassInfo type)
// 3. section field

// Usage: Copy and paste this script into MongoDB shell

// 1. First, let's see how many payments need migration
print("=== Payment Migration Script ===");
print("Checking existing payments...");

var paymentsToMigrate = db.payments.find({
  $or: [
    { academicYearId: { $exists: false } },
    { class: { $exists: false } },
    { section: { $exists: false } }
  ]
}).count();

print("Found " + paymentsToMigrate + " payments that need migration");

if (paymentsToMigrate === 0) {
  print("No payments need migration. Exiting.");
} else {
  print("Starting migration process...");
  
  var migratedCount = 0;
  var errorCount = 0;
  
  // Process payments in batches
  db.payments.find({
    $or: [
      { academicYearId: { $exists: false } },
      { class: { $exists: false } },
      { section: { $exists: false } }
    ]
  }).forEach(function(payment) {
    try {
      // Find the corresponding student enrollment
      var enrollment = db.student_enrollments.findOne({
        _id: ObjectId(payment.studentEnrollmentId)
      });
      
      if (!enrollment) {
        print("ERROR: Could not find enrollment for payment " + payment._id);
        errorCount++;
        return;
      }
      
      // Prepare update data
      var updateData = {};
      
      // Add academicYearId if missing
      if (!payment.academicYearId) {
        updateData.academicYearId = enrollment.academicYearId;
      }
      
      // Add class if missing
      if (!payment.class) {
        updateData.class = {
          className: enrollment.class.className,
          isActive: enrollment.class.isActive
        };
      }
      
      // Add section if missing
      if (!payment.section) {
        updateData.section = enrollment.section;
      }
      
      // Update the payment record
      var result = db.payments.updateOne(
        { _id: payment._id },
        { $set: updateData }
      );
      
      if (result.modifiedCount === 1) {
        migratedCount++;
        if (migratedCount % 10 === 0) {
          print("Migrated " + migratedCount + " payments...");
        }
      } else {
        print("WARNING: Failed to update payment " + payment._id);
        errorCount++;
      }
      
    } catch (error) {
      print("ERROR migrating payment " + payment._id + ": " + error.message);
      errorCount++;
    }
  });
  
  print("=== Migration Complete ===");
  print("Successfully migrated: " + migratedCount + " payments");
  print("Errors encountered: " + errorCount + " payments");
  
  // Verify migration
  print("=== Verification ===");
  var remainingToMigrate = db.payments.find({
    $or: [
      { academicYearId: { $exists: false } },
      { class: { $exists: false } },
      { section: { $exists: false } }
    ]
  }).count();
  
  print("Payments still needing migration: " + remainingToMigrate);
  
  if (remainingToMigrate === 0) {
    print("✅ All payments have been successfully migrated!");
  } else {
    print("⚠️ " + remainingToMigrate + " payments still need migration. Please investigate.");
  }
  
  // Show sample migrated record
  print("=== Sample Migrated Record ===");
  var samplePayment = db.payments.findOne(
    {
      academicYearId: { $exists: true },
      class: { $exists: true },
      section: { $exists: true }
    },
    {
      _id: 1,
      receiptNo: 1,
      academicYearId: 1,
      "class.className": 1,
      section: 1,
      "student.name": 1
    }
  );
  
  if (samplePayment) {
    print("Sample migrated payment:");
    printjson(samplePayment);
  }
}

print("=== Migration Script Complete ===");