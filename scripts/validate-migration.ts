#!/usr/bin/env tsx

import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface ValidationResults {
  academicYears: { csv: number; db: number; match: boolean };
  classes: { csv: number; db: number; match: boolean };
  students: { csv: number; db: number; match: boolean };
  enrollments: { csv: number; db: number; match: boolean };
  payments: { csv: number; db: number; match: boolean };
  totalMigrated: number;
  errors: string[];
  warnings: string[];
}

// Helper function to read CSV files
function readCSV(filePath: string): any[] {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: true
  });
}

async function validateAcademicYears(): Promise<{ csv: number; db: number; match: boolean }> {
  const csvPath = path.join(__dirname, '../data/2025/academic_year.csv');
  const csvData = readCSV(csvPath);
  const dbCount = await prisma.academicYear.count();
  
  return {
    csv: csvData.length,
    db: dbCount,
    match: csvData.length === dbCount
  };
}

async function validateClasses(): Promise<{ csv: number; db: number; match: boolean }> {
  const csvPath = path.join(__dirname, '../data/2025/class_info.csv');
  const csvData = readCSV(csvPath);
  const dbCount = await prisma.class.count();
  
  return {
    csv: csvData.length,
    db: dbCount,
    match: csvData.length === dbCount
  };
}

async function validateStudents(): Promise<{ csv: number; db: number; match: boolean }> {
  const csvPath = path.join(__dirname, '../data/2025/students_info.csv');
  const csvData = readCSV(csvPath);
  const dbCount = await prisma.student.count();
  
  return {
    csv: csvData.length,
    db: dbCount,
    match: csvData.length === dbCount
  };
}

async function validateEnrollments(): Promise<{ csv: number; db: number; match: boolean }> {
  const csvPath = path.join(__dirname, '../data/2025/student_year.csv');
  const csvData = readCSV(csvPath);
  const dbCount = await prisma.studentEnrollment.count();
  
  return {
    csv: csvData.length,
    db: dbCount,
    match: csvData.length === dbCount
  };
}

async function validatePayments(): Promise<{ csv: number; db: number; match: boolean }> {
  const csvPath = path.join(__dirname, '../data/2025/fee_txn.csv');
  const csvData = readCSV(csvPath);
  const dbCount = await prisma.payment.count();
  
  return {
    csv: csvData.length,
    db: dbCount,
    match: csvData.length === dbCount
  };
}

async function validateDataIntegrity(): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Check for students without enrollments
    const studentsWithoutEnrollments = await prisma.student.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    });
    
    const studentsWithEnrollments = await prisma.studentEnrollment.findMany({
      select: { studentId: true }
    });
    
    const enrolledStudentIds = new Set(studentsWithEnrollments.map(e => e.studentId));
    
    studentsWithoutEnrollments.forEach(student => {
      if (!enrolledStudentIds.has(student.id)) {
        warnings.push(`Student ${student.name} (${student.admissionNo}) has no enrollment`);
      }
    });
    
    // Check for orphaned payments
    const paymentsWithoutEnrollments = await prisma.payment.findMany({
      where: {
        studentEnrollment: null
      }
    });
    
    if (paymentsWithoutEnrollments.length > 0) {
      errors.push(`Found ${paymentsWithoutEnrollments.length} payments without valid enrollments`);
    }
    
    // Check for negative amounts
    const negativePayments = await prisma.payment.findMany({
      where: {
        totalAmount: {
          lt: 0
        }
      }
    });
    
    if (negativePayments.length > 0) {
      errors.push(`Found ${negativePayments.length} payments with negative amounts`);
    }
    
    // Check for fee structure consistency
    const feeStructures = await prisma.feeStructure.findMany();
    feeStructures.forEach(fs => {
      const calculatedTotal = fs.feeItems.reduce((sum, item) => sum + item.amount, 0);
      if (Math.abs(calculatedTotal - fs.totalFees.total) > 0.01) {
        errors.push(`Fee structure ${fs.name} has inconsistent totals: calculated ${calculatedTotal}, stored ${fs.totalFees.total}`);
      }
    });
    
    // Check enrollment totals consistency
    const enrollments = await prisma.studentEnrollment.findMany();
    enrollments.forEach(enrollment => {
      const calculatedFeeTotal = enrollment.fees.reduce((sum, fee) => sum + fee.amount, 0);
      if (Math.abs(calculatedFeeTotal - enrollment.totals.fees.total) > 0.01) {
        warnings.push(`Enrollment ${enrollment.id} has inconsistent fee totals`);
      }
      
      const calculatedScholarshipTotal = enrollment.scholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0);
      if (Math.abs(calculatedScholarshipTotal - enrollment.totals.scholarships.applied) > 0.01) {
        warnings.push(`Enrollment ${enrollment.id} has inconsistent scholarship totals`);
      }
    });
    
    // Check for duplicate admission numbers
    const admissionNumbers = await prisma.student.groupBy({
      by: ['admissionNo'],
      _count: {
        admissionNo: true
      },
      having: {
        admissionNo: {
          _count: {
            gt: 1
          }
        }
      }
    });
    
    if (admissionNumbers.length > 0) {
      errors.push(`Found ${admissionNumbers.length} duplicate admission numbers`);
    }
    
    // Check for missing mobile numbers
    const studentsWithoutMobile = await prisma.student.findMany({
      where: {
        mobileNumbers: {
          isEmpty: true
        }
      }
    });
    
    if (studentsWithoutMobile.length > 0) {
      warnings.push(`Found ${studentsWithoutMobile.length} students without mobile numbers`);
    }
    
  } catch (error) {
    errors.push(`Error during integrity check: ${error}`);
  }
  
  return { errors, warnings };
}

async function analyzeMigrationTracking(): Promise<void> {
  console.log('\n🔍 MIGRATION TRACKING ANALYSIS');
  console.log('===============================');
  
  // Analyze students migration data
  const studentsWithTracking = await prisma.student.findMany({
    where: {
      migrationData: {
        not: null
      }
    },
    select: {
      migrationData: true
    }
  });
  
  console.log(`📊 Students with migration tracking: ${studentsWithTracking.length}`);
  
  if (studentsWithTracking.length > 0) {
    const sourceTables = new Set(studentsWithTracking.map(s => (s.migrationData as any)?.sourceTable));
    const migrationDates = studentsWithTracking.map(s => (s.migrationData as any)?.migratedAt).filter(Boolean);
    
    console.log(`   Source tables: ${Array.from(sourceTables).join(', ')}`);
    console.log(`   Migration dates: ${new Date(Math.min(...migrationDates.map(d => new Date(d).getTime()))).toISOString().split('T')[0]} to ${new Date(Math.max(...migrationDates.map(d => new Date(d).getTime()))).toISOString().split('T')[0]}`);
  }
  
  // Analyze enrollments migration data
  const enrollmentsWithTracking = await prisma.studentEnrollment.findMany({
    where: {
      migrationData: {
        not: null
      }
    },
    select: {
      migrationData: true
    }
  });
  
  console.log(`📊 Enrollments with migration tracking: ${enrollmentsWithTracking.length}`);
  
  // Analyze payments migration data
  const paymentsWithTracking = await prisma.payment.findMany({
    where: {
      migrationData: {
        not: null
      }
    },
    select: {
      migrationData: true,
      totalAmount: true
    }
  });
  
  console.log(`📊 Payments with migration tracking: ${paymentsWithTracking.length}`);
  
  if (paymentsWithTracking.length > 0) {
    const totalMigratedAmount = paymentsWithTracking.reduce((sum, p) => sum + p.totalAmount, 0);
    console.log(`   Total migrated payment amount: ₹${totalMigratedAmount.toLocaleString()}`);
  }
  
  // Find any records without migration tracking (potential issues)
  const studentsWithoutTracking = await prisma.student.count({
    where: {
      migrationData: null
    }
  });
  
  const enrollmentsWithoutTracking = await prisma.studentEnrollment.count({
    where: {
      migrationData: null
    }
  });
  
  const paymentsWithoutTracking = await prisma.payment.count({
    where: {
      migrationData: null
    }
  });
  
  if (studentsWithoutTracking > 0 || enrollmentsWithoutTracking > 0 || paymentsWithoutTracking > 0) {
    console.log('\n⚠️  Records without migration tracking:');
    if (studentsWithoutTracking > 0) console.log(`   Students: ${studentsWithoutTracking}`);
    if (enrollmentsWithoutTracking > 0) console.log(`   Enrollments: ${enrollmentsWithoutTracking}`);
    if (paymentsWithoutTracking > 0) console.log(`   Payments: ${paymentsWithoutTracking}`);
  }
}

async function generateSummaryReport(): Promise<void> {
  console.log('\n📊 MIGRATION SUMMARY REPORT');
  console.log('================================');
  
  // Count totals
  const totalStudents = await prisma.student.count();
  const totalActiveStudents = await prisma.student.count({ where: { isActive: true } });
  const totalEnrollments = await prisma.studentEnrollment.count();
  const totalPayments = await prisma.payment.count();
  const totalFeeStructures = await prisma.feeStructure.count();
  
  console.log(`📚 Students: ${totalStudents} (${totalActiveStudents} active)`);
  console.log(`🎓 Enrollments: ${totalEnrollments}`);
  console.log(`💳 Payments: ${totalPayments}`);
  console.log(`📋 Fee Structures: ${totalFeeStructures}`);
  
  // Financial summary
  const totalCollected = await prisma.payment.aggregate({
    _sum: { totalAmount: true }
  });
  
  const enrollmentTotals = await prisma.studentEnrollment.findMany({
    select: {
      totals: true
    }
  });
  
  const totalDue = enrollmentTotals.reduce((sum, e) => sum + e.totals.netAmount.due, 0);
  const totalFees = enrollmentTotals.reduce((sum, e) => sum + e.totals.fees.total, 0);
  const totalScholarships = enrollmentTotals.reduce((sum, e) => sum + e.totals.scholarships.applied, 0);
  
  console.log('\n💰 FINANCIAL SUMMARY:');
  console.log(`   Total Fees: ₹${totalFees.toLocaleString()}`);
  console.log(`   Total Scholarships: ₹${totalScholarships.toLocaleString()}`);
  console.log(`   Total Collected: ₹${(totalCollected._sum.totalAmount || 0).toLocaleString()}`);
  console.log(`   Total Due: ₹${totalDue.toLocaleString()}`);
  console.log(`   Collection %: ${totalFees > 0 ? ((totalCollected._sum.totalAmount || 0) / totalFees * 100).toFixed(2) : 0}%`);
  
  // Class-wise breakdown
  console.log('\n📊 CLASS-WISE BREAKDOWN:');
  const classBreakdown = await prisma.studentEnrollment.findMany({
    select: {
      class: true,
      totals: true
    }
  });
  
  const classMap = new Map<string, { count: number; totalFees: number; totalPaid: number }>();
  
  classBreakdown.forEach(enrollment => {
    const className = enrollment.class.className;
    const existing = classMap.get(className) || { count: 0, totalFees: 0, totalPaid: 0 };
    
    classMap.set(className, {
      count: existing.count + 1,
      totalFees: existing.totalFees + enrollment.totals.fees.total,
      totalPaid: existing.totalPaid + enrollment.totals.fees.paid
    });
  });
  
  Array.from(classMap.entries())
    .sort(([a], [b]) => {
      // Custom sort for class names
      const order = ['L.K.G', 'U.K.G', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11-A', '11-B', '11-C', '12-A', '12-B', '12-C'];
      return order.indexOf(a) - order.indexOf(b);
    })
    .forEach(([className, data]) => {
      const collectionRate = data.totalFees > 0 ? (data.totalPaid / data.totalFees * 100).toFixed(1) : '0.0';
      console.log(`   ${className.padEnd(6)}: ${data.count.toString().padStart(3)} students | ₹${data.totalFees.toLocaleString().padStart(8)} | ${collectionRate}%`);
    });
}

async function main() {
  console.log('🔍 Starting migration validation...');
  
  const results: ValidationResults = {
    academicYears: await validateAcademicYears(),
    classes: await validateClasses(),
    students: await validateStudents(),
    enrollments: await validateEnrollments(),
    payments: await validatePayments(),
    totalMigrated: 0,
    errors: [],
    warnings: []
  };
  
  // Data integrity check
  const integrityResults = await validateDataIntegrity();
  results.errors = integrityResults.errors;
  results.warnings = integrityResults.warnings;
  
  results.totalMigrated = results.students.db + results.enrollments.db + results.payments.db;
  
  // Print results
  console.log('\n✅ VALIDATION RESULTS');
  console.log('=====================');
  
  console.log(`📅 Academic Years: ${results.academicYears.csv} CSV → ${results.academicYears.db} DB ${results.academicYears.match ? '✅' : '❌'}`);
  console.log(`🏫 Classes: ${results.classes.csv} CSV → ${results.classes.db} DB ${results.classes.match ? '✅' : '❌'}`);
  console.log(`👨‍🎓 Students: ${results.students.csv} CSV → ${results.students.db} DB ${results.students.match ? '✅' : '❌'}`);
  console.log(`📚 Enrollments: ${results.enrollments.csv} CSV → ${results.enrollments.db} DB ${results.enrollments.match ? '✅' : '❌'}`);
  console.log(`💳 Payments: ${results.payments.csv} CSV → ${results.payments.db} DB ${results.payments.match ? '✅' : '❌'}`);
  
  console.log(`\n📊 Total Records Migrated: ${results.totalMigrated}`);
  
  // Show errors
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }
  
  // Show warnings
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
  }
  
  // Generate summary report
  await generateSummaryReport();
  
  // Analyze migration tracking
  await analyzeMigrationTracking();
  
  // Overall status
  const allMatched = results.academicYears.match && results.classes.match && 
                    results.students.match && results.enrollments.match && results.payments.match;
  const hasErrors = results.errors.length > 0;
  
  console.log('\n🎯 OVERALL STATUS:');
  if (allMatched && !hasErrors) {
    console.log('✅ Migration completed successfully with no errors!');
  } else if (allMatched && hasErrors) {
    console.log('⚠️  Migration completed but with some data integrity issues.');
  } else {
    console.log('❌ Migration has count mismatches or critical errors.');
  }
  
  console.log('\n📝 NEXT STEPS:');
  console.log('   1. Review any errors or warnings above');
  console.log('   2. Test the application with migrated data');
  console.log('   3. Update any missing information manually');
  console.log('   4. Change default admin password');
  
  await prisma.$disconnect();
  
  if (hasErrors && !allMatched) {
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { main as validateMigration };