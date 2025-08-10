#!/usr/bin/env tsx

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

interface MigrationQuery {
  name: string;
  description: string;
  query: () => Promise<void>;
}

// Query to find original student by old student_id
async function findOriginalStudent(oldStudentId: string) {
  const student = await prisma.student.findFirst({
    where: {
      migrationData: {
        path: ['sourceId'],
        equals: oldStudentId
      }
    },
    select: {
      id: true,
      name: true,
      admissionNo: true,
      migrationData: true
    }
  });
  
  if (student) {
    console.log('🔍 Found student:');
    console.log(`   Name: ${student.name}`);
    console.log(`   Admission No: ${student.admissionNo}`);
    console.log(`   MongoDB ID: ${student.id}`);
    console.log(`   Original student_id: ${(student.migrationData as any)?.sourceId}`);
    console.log(`   Migration Date: ${(student.migrationData as any)?.migratedAt}`);
  } else {
    console.log(`❌ No student found with original student_id: ${oldStudentId}`);
  }
}

// Query to find enrollment by old student_year.id
async function findEnrollmentByStudentYear(oldStudentYearId: string) {
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      migrationData: {
        path: ['sourceId'],
        equals: oldStudentYearId
      }
    },
    select: {
      id: true,
      student: true,
      academicYear: true,
      class: true,
      section: true,
      totals: true,
      migrationData: true
    }
  });
  
  if (enrollment) {
    console.log('🔍 Found enrollment:');
    console.log(`   Student: ${enrollment.student.name} (${enrollment.student.admissionNumber})`);
    console.log(`   Class: ${enrollment.class.className} - Section: ${enrollment.section}`);
    console.log(`   Academic Year: ${enrollment.academicYear.year}`);
    console.log(`   Total Fees: ₹${enrollment.totals.fees.total}`);
    console.log(`   Amount Due: ₹${enrollment.totals.netAmount.due}`);
    console.log(`   Original student_year.id: ${(enrollment.migrationData as any)?.sourceId}`);
    console.log(`   Original student_id: ${(enrollment.migrationData as any)?.originalStudentId}`);
  } else {
    console.log(`❌ No enrollment found with original student_year.id: ${oldStudentYearId}`);
  }
}

// Query to find payment by old fee_txn.id
async function findPaymentByFeeTxn(oldFeeTxnId: string) {
  const payment = await prisma.payment.findFirst({
    where: {
      migrationData: {
        path: ['sourceId'],
        equals: oldFeeTxnId
      }
    },
    select: {
      id: true,
      receiptNo: true,
      totalAmount: true,
      paymentDate: true,
      student: true,
      paymentItems: true,
      migrationData: true
    }
  });
  
  if (payment) {
    console.log('🔍 Found payment:');
    console.log(`   Receipt No: ${payment.receiptNo}`);
    console.log(`   Student: ${payment.student.name} (${payment.student.admissionNumber})`);
    console.log(`   Amount: ₹${payment.totalAmount}`);
    console.log(`   Date: ${payment.paymentDate.toISOString().split('T')[0]}`);
    console.log(`   Fee Breakdown:`);
    const breakdown = (payment.migrationData as any)?.feeBreakdown || {};
    Object.entries(breakdown).forEach(([key, value]) => {
      if (value && parseFloat(value as string) > 0) {
        console.log(`     ${key}: ₹${value}`);
      }
    });
    console.log(`   Original fee_txn.id: ${(payment.migrationData as any)?.sourceId}`);
    console.log(`   Original student_year.id: ${(payment.migrationData as any)?.originalStudentYearId}`);
  } else {
    console.log(`❌ No payment found with original fee_txn.id: ${oldFeeTxnId}`);
  }
}

// Query to trace complete student journey
async function traceStudentJourney(oldStudentId: string) {
  console.log(`🔍 Tracing complete journey for original student_id: ${oldStudentId}`);
  console.log('='.repeat(60));
  
  // Find student
  const student = await prisma.student.findFirst({
    where: {
      migrationData: {
        path: ['sourceId'],
        equals: oldStudentId
      }
    }
  });
  
  if (!student) {
    console.log(`❌ Student not found with original student_id: ${oldStudentId}`);
    return;
  }
  
  console.log(`👨‍🎓 STUDENT: ${student.name} (${student.admissionNo})`);
  
  // Find enrollment
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: student.id
    },
    include: {
      payments: true
    }
  });
  
  if (enrollment) {
    console.log(`📚 ENROLLMENT:`);
    console.log(`   Class: ${enrollment.class.className} - Section: ${enrollment.section}`);
    console.log(`   Total Fees: ₹${enrollment.totals.fees.total}`);
    console.log(`   Scholarships Applied: ₹${enrollment.totals.scholarships.applied}`);
    console.log(`   Net Amount: ₹${enrollment.totals.netAmount.total}`);
    console.log(`   Amount Paid: ₹${enrollment.totals.netAmount.paid}`);
    console.log(`   Amount Due: ₹${enrollment.totals.netAmount.due}`);
    console.log(`   Original student_year.id: ${(enrollment.migrationData as any)?.sourceId}`);
    
    if (enrollment.payments.length > 0) {
      console.log(`💳 PAYMENTS (${enrollment.payments.length} transactions):`);
      enrollment.payments.forEach((payment, index) => {
        console.log(`   ${index + 1}. Receipt: ${payment.receiptNo} | ₹${payment.totalAmount} | ${payment.paymentDate.toISOString().split('T')[0]}`);
        console.log(`      Original fee_txn.id: ${(payment.migrationData as any)?.sourceId}`);
      });
    } else {
      console.log(`💳 PAYMENTS: No payments found`);
    }
  } else {
    console.log(`📚 ENROLLMENT: Not found`);
  }
}

// Statistics about migration data quality
async function migrationDataQualityReport() {
  console.log('📊 MIGRATION DATA QUALITY REPORT');
  console.log('='.repeat(40));
  
  // Check for missing migration data
  const totalStudents = await prisma.student.count();
  const studentsWithMigrationData = await prisma.student.count({
    where: { migrationData: { not: null } }
  });
  
  const totalEnrollments = await prisma.studentEnrollment.count();
  const enrollmentsWithMigrationData = await prisma.studentEnrollment.count({
    where: { migrationData: { not: null } }
  });
  
  const totalPayments = await prisma.payment.count();
  const paymentsWithMigrationData = await prisma.payment.count({
    where: { migrationData: { not: null } }
  });
  
  console.log(`📈 Coverage Report:`);
  console.log(`   Students: ${studentsWithMigrationData}/${totalStudents} (${(studentsWithMigrationData/totalStudents*100).toFixed(1)}%)`);
  console.log(`   Enrollments: ${enrollmentsWithMigrationData}/${totalEnrollments} (${(enrollmentsWithMigrationData/totalEnrollments*100).toFixed(1)}%)`);
  console.log(`   Payments: ${paymentsWithMigrationData}/${totalPayments} (${(paymentsWithMigrationData/totalPayments*100).toFixed(1)}%)`);
  
  // Check migration dates consistency
  const migrationDates = await prisma.student.findMany({
    where: { migrationData: { not: null } },
    select: { migrationData: true }
  });
  
  if (migrationDates.length > 0) {
    const dates = migrationDates.map(s => (s.migrationData as any)?.migratedAt).filter(Boolean);
    if (dates.length > 0) {
      const sortedDates = dates.sort();
      console.log(`📅 Migration Time Range: ${sortedDates[0].split('T')[0]} to ${sortedDates[sortedDates.length - 1].split('T')[0]}`);
    }
  }
  
  // Check for duplicate source IDs
  const duplicateStudents = await prisma.$queryRaw`
    SELECT 
      "migrationData"->>'sourceId' as source_id,
      COUNT(*) as count
    FROM "students" 
    WHERE "migrationData" IS NOT NULL
    GROUP BY "migrationData"->>'sourceId'
    HAVING COUNT(*) > 1
  ` as Array<{ source_id: string; count: number }>;
  
  if (duplicateStudents.length > 0) {
    console.log(`⚠️  Found ${duplicateStudents.length} duplicate source IDs in students`);
  } else {
    console.log(`✅ No duplicate source IDs found in students`);
  }
}

const queries: MigrationQuery[] = [
  {
    name: 'find-student',
    description: 'Find student by original student_id from students_info table',
    query: async () => {
      const oldStudentId = process.argv[4];
      if (!oldStudentId) {
        console.log('Usage: npm run migration-tracker find-student <old_student_id>');
        return;
      }
      await findOriginalStudent(oldStudentId);
    }
  },
  {
    name: 'find-enrollment',
    description: 'Find enrollment by original student_year.id',
    query: async () => {
      const oldStudentYearId = process.argv[4];
      if (!oldStudentYearId) {
        console.log('Usage: npm run migration-tracker find-enrollment <old_student_year_id>');
        return;
      }
      await findEnrollmentByStudentYear(oldStudentYearId);
    }
  },
  {
    name: 'find-payment',
    description: 'Find payment by original fee_txn.id',
    query: async () => {
      const oldFeeTxnId = process.argv[4];
      if (!oldFeeTxnId) {
        console.log('Usage: npm run migration-tracker find-payment <old_fee_txn_id>');
        return;
      }
      await findPaymentByFeeTxn(oldFeeTxnId);
    }
  },
  {
    name: 'trace-journey',
    description: 'Trace complete student journey from old student_id',
    query: async () => {
      const oldStudentId = process.argv[4];
      if (!oldStudentId) {
        console.log('Usage: npm run migration-tracker trace-journey <old_student_id>');
        return;
      }
      await traceStudentJourney(oldStudentId);
    }
  },
  {
    name: 'quality-report',
    description: 'Generate migration data quality report',
    query: migrationDataQualityReport
  }
];

async function main() {
  const command = process.argv[3];
  
  if (!command) {
    console.log('🔍 Migration Tracker - Query migrated data using original IDs');
    console.log('='.repeat(60));
    console.log('Available commands:');
    queries.forEach(q => {
      console.log(`   ${q.name.padEnd(20)} - ${q.description}`);
    });
    console.log('\nExamples:');
    console.log('   npm run migration-tracker find-student 1443');
    console.log('   npm run migration-tracker find-enrollment 1');
    console.log('   npm run migration-tracker find-payment 1');
    console.log('   npm run migration-tracker trace-journey 1443');
    console.log('   npm run migration-tracker quality-report');
    return;
  }
  
  const query = queries.find(q => q.name === command);
  if (query) {
    await query.query();
  } else {
    console.log(`❌ Unknown command: ${command}`);
    console.log('Available commands:', queries.map(q => q.name).join(', '));
  }
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { main as migrationTracker };