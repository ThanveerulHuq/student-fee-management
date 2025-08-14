#!/usr/bin/env tsx

import { PrismaClient } from '@/generated/prisma';

// TypeScript migration script to update existing payments with ClassInfo, section, and academicYearId
// Run with: npx tsx scripts/migrate-payments.ts

const prisma = new PrismaClient();

async function migratePayments() {
  console.log("=== Payment Migration Script ===");
  console.log("Checking existing payments...");

  try {
    // Count payments that need migration (using raw query for fields that might not exist)
    const paymentsToMigrate = await prisma.payment.count();

    console.log(`Found ${paymentsToMigrate} payments that need migration`);

    if (paymentsToMigrate === 0) {
      console.log("No payments need migration. Exiting.");
      return;
    }

    console.log("Starting migration process...");

    // Get all payments (we'll check which need migration in the loop)
    const payments = await prisma.payment.findMany();

    let migratedCount = 0;
    let errorCount = 0;

    // Process payments in batches
    for (const payment of payments) {
      try {
        // Find the corresponding student enrollment
        const enrollment = await prisma.studentEnrollment.findUnique({
          where: { id: payment.studentEnrollmentId }
        });

        if (!enrollment) {
          console.log(`ERROR: Could not find enrollment for payment ${payment.id}`);
          errorCount++;
          continue;
        }

        // Prepare update data - always update to ensure consistency
        const updateData: any = {
          academicYearId: enrollment.academicYearId,
          class: {
            className: enrollment.class.className,
            isActive: enrollment.class.isActive
          },
          section: enrollment.section
        };

        // Update the payment record
        await prisma.payment.update({
          where: { id: payment.id },
          data: updateData
        });

        migratedCount++;
        if (migratedCount % 10 === 0) {
          console.log(`Migrated ${migratedCount} payments...`);
        }

      } catch (error) {
        console.log(`ERROR migrating payment ${payment.id}:`, error);
        errorCount++;
      }
    }

    console.log("=== Migration Complete ===");
    console.log(`Successfully migrated: ${migratedCount} payments`);
    console.log(`Errors encountered: ${errorCount} payments`);

    // Show sample migrated record
    console.log("=== Sample Migrated Record ===");
    const samplePayment = await prisma.payment.findFirst({
      select: {
        id: true,
        receiptNo: true,
        academicYearId: true,
        class: true,
        section: true,
        student: {
          select: {
            name: true
          }
        }
      }
    });

    if (samplePayment) {
      console.log("Sample migrated payment:");
      console.log(JSON.stringify(samplePayment, null, 2));
    }

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }

  console.log("=== Migration Script Complete ===");
}

// Run the migration
migratePayments().catch(console.error);