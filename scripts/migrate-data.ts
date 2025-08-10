#!/usr/bin/env tsx

import { PrismaClient } from '../src/generated/prisma';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CSVData {
  academicYear: any[];
  classInfo: any[];
  studentsInfo: any[];
  studentYear: any[];
  feeTxn: any[];
  paidFee: any[];
  commonFee: any[];
}

// Helper function to read and parse CSV files
function readCSV(filePath: string): any[] {
  const csvContent = fs.readFileSync(filePath, 'utf-8');
  return parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: true
  });
}

// Helper function to create migration tracking data
function createMigrationData(sourceTable: string, sourceId: string | number, additionalData?: Record<string, any>) {
  return {
    sourceTable,
    sourceId: sourceId.toString(),
    migratedAt: new Date().toISOString(),
    migrationVersion: '1.0.0',
    migrationScript: 'migrate-data.ts',
    ...additionalData
  };
}

// Load all CSV data
function loadCSVData(): CSVData {
  const dataDir = path.join(__dirname, '../data/2025');
  
  return {
    academicYear: readCSV(path.join(dataDir, 'academic_year.csv')),
    classInfo: readCSV(path.join(dataDir, 'class_info.csv')),
    studentsInfo: readCSV(path.join(dataDir, 'students_info.csv')),
    studentYear: readCSV(path.join(dataDir, 'student_year.csv')),
    feeTxn: readCSV(path.join(dataDir, 'fee_txn.csv')),
    paidFee: readCSV(path.join(dataDir, 'paid_fee.csv')),
    commonFee: readCSV(path.join(dataDir, 'common_fee.csv'))
  };
}

// Migration functions
async function migrateAcademicYears(data: any[]) {
  console.log('🔄 Migrating Academic Years...');
  
  for (const row of data) {
    // Assuming academic year format is "2025-2026"
    const year = row.year;
    const [startYear, endYear] = year.split('-');
    
    await prisma.academicYear.upsert({
      where: { year },
      update: {},
      create: {
        year,
        startDate: new Date(`${startYear}-04-01`), // Assuming April start
        endDate: new Date(`20${endYear}-03-31`), // March end
        isActive: true
      }
    });
  }
  
  console.log('✅ Academic Years migrated');
}

async function migrateClasses(data: any[]) {
  console.log('🔄 Migrating Classes...');
  
  for (const row of data) {
    await prisma.class.upsert({
      where: { className: row.class_name.toString() },
      update: {},
      create: {
        className: row.class_name.toString(),
        order: parseInt(row.class_id),
        isActive: true
      }
    });
  }
  
  console.log('✅ Classes migrated');
}

async function createDefaultFeeTemplates() {
  console.log('🔄 Creating default fee templates...');
  
  const feeTemplates = [
    { name: 'School Fee', category: 'REGULAR', order: 1 },
    { name: 'Book Fee', category: 'REGULAR', order: 2 },
    { name: 'Uniform Fee', category: 'OPTIONAL', order: 3 },
    { name: 'Islamic Studies', category: 'OPTIONAL', order: 4 },
    { name: 'Van Fee', category: 'OPTIONAL', order: 5 }
  ];
  
  for (const template of feeTemplates) {
    await prisma.feeTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: {
        name: template.name,
        category: template.category as any,
        order: template.order,
        isActive: true
      }
    });
  }
  
  console.log('✅ Fee templates created');
}

async function createDefaultScholarshipTemplates() {
  console.log('🔄 Creating default scholarship templates...');
  
  const scholarshipTemplates = [
    { name: 'Scholarship', type: 'GENERAL', order: 1 },
  ];
  
  for (const template of scholarshipTemplates) {
    await prisma.scholarshipTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: {
        name: template.name,
        type: template.type as any,
        order: template.order,
        isActive: true
      }
    });
  }
  
  console.log('✅ Scholarship templates created');
}

async function migrateStudents(data: any[]) {
  console.log('🔄 Migrating Students...');

  console.log(`input data count: ${data.length}`);
  
  for (const row of data) {
    console.log(`processing row: ${row.name}`);
    // Parse mobile numbers
    const mobileNumbers = [];
    if (row.mobile_no1 && row.mobile_no1 !== '0') {
      mobileNumbers.push({
        number: row.mobile_no1.toString(),
        isPrimary: true,
        isWhatsApp: true,
        label: 'Primary'
      });
    }
    if (row.mobile_no2 && row.mobile_no2 !== '0' && row.mobile_no2 !== row.mobile_no1) {
      mobileNumbers.push({
        number: row.mobile_no2.toString(),
        isPrimary: false,
        isWhatsApp: false,
        label: 'Secondary'
      });
    }
    
    await prisma.student.upsert({
      where: { admissionNo: row.admission_no.toString() },
      update: {},
      create: {
        admissionNo: row.admission_no.toString(),
        aadharNo: row.aadhar_no && row.aadhar_no !== '0' ? row.aadhar_no.toString() : null,
        emisNo: row.emis_no && row.emis_no !== '0' ? row.emis_no.toString() : null,
        name: row.name,
        gender: row.gender === 'M' ? 'MALE' : 'FEMALE',
        dateOfBirth: new Date(row.dob),
        age: parseInt(row.age),
        community: row.community.toString(),
        motherTongue: row.mother_tongue.toString(),
        mobileNumbers,
        fatherName: row.father_name.toString(),
        motherName: row.mother_name.toString(),
        address: row.address.toString(),
        previousSchool: row.previous_school ? row.previous_school.toString() : null,
        religion: row.religion.toString(),
        caste: row.caste.toString(),
        nationality: row.nationality || 'Indian',
        remarks: row.remarks? row.remarks.toString() : null,
        siblingIds: [],
        isActive: true,
        admissionDate: new Date(row.admission_date),
        migrationData: createMigrationData('students_info', row.student_id, {
          originalAdmissionNo: row.admission_no.toString(),
          originalActive: row.active,
          mobileNumbersCount: mobileNumbers.length,
          hasAadhar: !!(row.aadhar_no && row.aadhar_no !== '0'),
          hasEmis: !!(row.emis_no && row.emis_no !== '0')
        })
      }
    });
    console.log(`processed row: ${row.name}`);
  }
  
  console.log('✅ Students migrated');
}

async function createFeeStructures(csvData: CSVData) {
  console.log('🔄 Creating Fee Structures using common_fee data...');
  
  const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  const classes = await prisma.class.findMany();
  const feeTemplates = await prisma.feeTemplate.findMany();
  const scholarshipTemplates = await prisma.scholarshipTemplate.findMany();
  
  if (!academicYear) {
    throw new Error('No active academic year found');
  }
  
  // Create a mapping of class_id from CSV to actual Class objects
  const classIdToClassMap = new Map();
  for (const classRow of csvData.classInfo) {
    const classObj = classes.find(c => c.className === classRow.class_name.toString());
    if (classObj) {
      classIdToClassMap.set(classRow.class_id.toString(), classObj);
    }
  }
  
  console.log(`Found ${csvData.commonFee.length} common fee records`);
  
  // Create fee structures based on common_fee data
  for (const commonFeeRow of csvData.commonFee) {
    const classObj = classIdToClassMap.get(commonFeeRow.class_id.toString());
    
    if (!classObj) {
      console.warn(`Class not found for class_id: ${commonFeeRow.class_id}`);
      continue;
    }
    
    // Create fee items based on the common_fee data and templates
    const feeItems = [];
    
    // School Fee (from common_fee.school_fee)
    const schoolFeeTemplate = feeTemplates.find(t => t.name === 'School Fee');
    if (schoolFeeTemplate && commonFeeRow.school_fee) {
      feeItems.push({
        id: schoolFeeTemplate.id,
        templateId: schoolFeeTemplate.id,
        templateName: schoolFeeTemplate.name,
        templateCategory: schoolFeeTemplate.category,
        amount: parseFloat(commonFeeRow.school_fee),
        isCompulsory: schoolFeeTemplate.category === 'REGULAR',
        isEditableDuringEnrollment: true,
        order: schoolFeeTemplate.order
      });
    }
    
    // Book Fee (from common_fee.book_fee)
    const bookFeeTemplate = feeTemplates.find(t => t.name === 'Book Fee');
    if (bookFeeTemplate && commonFeeRow.book_fee) {
      feeItems.push({
        id: bookFeeTemplate.id,
        templateId: bookFeeTemplate.id,
        templateName: bookFeeTemplate.name,
        templateCategory: bookFeeTemplate.category,
        amount: parseFloat(commonFeeRow.book_fee),
        isCompulsory: bookFeeTemplate.category === 'REGULAR',
        isEditableDuringEnrollment: true,
        order: bookFeeTemplate.order
      });
    }
    
    // Add other fee templates with default amounts (these will be customized per student)
    const otherTemplates = feeTemplates.filter(t => !['School Fee', 'Book Fee'].includes(t.name));
    for (const template of otherTemplates) {
      feeItems.push({
        id: template.id,
        templateId: template.id,
        templateName: template.name,
        templateCategory: template.category,
        amount: 0, // Default amount, will be set per student
        isCompulsory: template.category === 'REGULAR',
        isEditableDuringEnrollment: true,
        order: template.order
      });
    }
    
    // Create scholarship items
    const scholarshipItems = scholarshipTemplates.map(template => ({
      id: template.id,
      templateId: template.id,
      templateName: template.name,
      templateType: template.type,
      amount: 0, // Default scholarship amount
      isEditableDuringEnrollment: true,
      order: template.order
    }));
    
    // Calculate totals
    const totalFees = {
      compulsory: feeItems.filter(f => f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
      optional: feeItems.filter(f => !f.isCompulsory).reduce((sum, f) => sum + f.amount, 0),
      total: feeItems.reduce((sum, f) => sum + f.amount, 0)
    };
    
    const totalScholarships = {
      autoApplied: 0,
      manual: 0,
      total: 0
    };
    
    await prisma.feeStructure.upsert({
      where: { 
        academicYearId_classId: { 
          academicYearId: academicYear.id, 
          classId: classObj.id 
        } 
      },
      update: {
        feeItems,
        totalFees,
        scholarshipItems,
        totalScholarships
      },
      create: {
        academicYearId: academicYear.id,
        classId: classObj.id,
        name: `${academicYear.year} - ${classObj.className}`,
        description: `Fee structure for ${classObj.className} - ${academicYear.year} (from common_fee.id: ${commonFeeRow.id})`,
        isActive: true,
        academicYear: {
          year: academicYear.year,
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
          isActive: academicYear.isActive
        },
        class: {
          className: classObj.className,
          order: classObj.order,
          isActive: classObj.isActive
        },
        feeItems,
        scholarshipItems,
        totalFees,
        totalScholarships,
      }
    });
    
    console.log(`Created fee structure for class ${classObj.className} (common_fee.id: ${commonFeeRow.id})`);
  }
  
  console.log('✅ Fee Structures created from common_fee data');
}

// Helper function to extract fee amounts from student year data
function getStudentFeeAmount(templateName: string, row: any): number {
  const mapping: Record<string, string> = {
    'Uniform Fee': 'uniform_fee',
    'Islamic Studies': 'islamic_studies',
    'Van Fee': 'van_fee'
  };
  
  const fieldName = mapping[templateName];
  if (fieldName && row[fieldName] !== undefined) {
    return parseFloat(row[fieldName]) || 0;
  }
  
  return 0;
}

async function migrateStudentEnrollments(csvData: CSVData): Promise<Map<string, string>> {
  console.log('🔄 Migrating Student Enrollments...');
  
  const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  const students = await prisma.student.findMany();
  const classes = await prisma.class.findMany();
  const feeStructures = await prisma.feeStructure.findMany();


  // Create maps for efficient lookups
  const classIdToClassMap = new Map();
  for (const classRow of csvData.classInfo) {
    const classObj = classes.find(c => c.className === classRow.class_name.toString());
    if (classObj) {
      classIdToClassMap.set(classRow.class_id.toString(), classObj);
    }
  }

  // Create map from common_fee.id to common_fee data and associated class
  const commonFeeMap = new Map();
  for (const commonFeeRow of csvData.commonFee) {
    const classObj = classIdToClassMap.get(commonFeeRow.class_id.toString());
    if (classObj) {
      commonFeeMap.set(commonFeeRow.id.toString(), {
        ...commonFeeRow,
        classObj
      });
    }
  }
  
  if (!academicYear) {
    throw new Error('No active academic year found');
  }
  
  // Create maps for quick lookup
  const studentMap = new Map(students.map(s => [(s.migrationData as any)?.sourceId, s]));
  
  // Create a map to track student_year.id to enrollment mapping for payments
  const studentYearToEnrollmentMap = new Map<string, string>();
  
  for (const row of csvData.studentYear) {
    const student = studentMap.get(row.student_id.toString());
    if (!student) {
      console.warn(`Student not found for student_id: ${row.student_id}`);
      continue;
    }
    
    // Get class info through common_fee relationship
    const commonFeeData = commonFeeMap.get(row.common_fee.toString());
    if (!commonFeeData) {
      console.warn(`Common fee not found for common_fee.id: ${row.common_fee}`);
      continue;
    }
    
    const classInfo = commonFeeData.classObj;
    
    const feeStructure = feeStructures.find(fs => 
      fs.academicYearId === academicYear.id && fs.classId === classInfo.id
    );
    
    if (!feeStructure) {
      console.warn(`Fee structure not found for class: ${classInfo.className}`);
      continue;
    }
    
    // Create individual student fees based on the fee structure and student_year data
    const studentFees = feeStructure.feeItems.map(feeItem => {
      let studentAmount = 0;
      
      // Get actual amounts from student_year data and common_fee data
      if (feeItem.templateName === 'School Fee') {
        studentAmount = parseFloat(commonFeeData.school_fee) || 0;
      } else if (feeItem.templateName === 'Book Fee') {
        studentAmount = parseFloat(commonFeeData.book_fee) || 0;
      } else {
        // For other fees, use the amounts from student_year
        studentAmount = getStudentFeeAmount(feeItem.templateName, row);
      }
      
      return {
        id: feeItem.id,
        feeItemId: feeItem.id,
        templateId: feeItem.templateId,
        templateName: feeItem.templateName,
        templateCategory: feeItem.templateCategory,
        amount: studentAmount,
        originalAmount: feeItem.amount,
        amountPaid: 0, // Will be calculated from transactions
        amountDue: studentAmount,
        isCompulsory: feeItem.isCompulsory
      };
    });
    
    // Create student scholarships
    const studentScholarships = [{
      id: feeStructure.scholarshipItems[0]?.id || '',
      scholarshipItemId: feeStructure.scholarshipItems[0]?.id || '',
      templateId: feeStructure.scholarshipItems[0]?.templateId || '',
      templateName: feeStructure.scholarshipItems[0]?.templateName || 'General Scholarship',
      templateType: feeStructure.scholarshipItems[0]?.templateType || 'GENERAL',
      amount: parseFloat(row.scholorship),
      originalAmount: parseFloat(row.scholorship),
      isAutoApplied: true,
      appliedDate: new Date(),
      appliedBy: 'system',
      isActive: true,
      remarks: 'Migrated from old system'
    }];
    
    // Calculate totals
    const totalFeeAmount = studentFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalScholarshipAmount = studentScholarships.reduce((sum, scholarship) => sum + scholarship.amount, 0);
    const netAmount = totalFeeAmount - totalScholarshipAmount;
    
    const totals = {
      fees: {
        total: totalFeeAmount,
        paid: 0, // Will be updated from transactions
        due: totalFeeAmount
      },
      scholarships: {
        applied: totalScholarshipAmount
      },
      netAmount: {
        total: netAmount,
        paid: 0,
        due: netAmount
      }
    };
    
    const feeStatus = {
      status: 'PARTIAL' as any,
      lastPaymentDate: null,
      nextDueDate: null,
      overdueAmount: 0
    };
    
    const enrollment = await prisma.studentEnrollment.upsert({
      where: {
        studentId_academicYearId: {
          studentId: student.id,
          academicYearId: academicYear.id
        }
      },
      update: {},
      create: {
        studentId: student.id,
        academicYearId: academicYear.id,
        classId: classInfo.id,
        section: row.section,
        enrollmentDate: new Date(),
        isActive: true,
        student: {
          admissionNumber: student.admissionNo,
          name: student.name,
          fatherName: student.fatherName,
          mobileNo: student.mobileNumbers[0]?.number || '',
          class: classInfo.className,
          status: 'ACTIVE'
        },
        academicYear: {
          year: academicYear.year,
          startDate: academicYear.startDate,
          endDate: academicYear.endDate,
          isActive: academicYear.isActive
        },
        class: {
          className: classInfo.className,
          order: classInfo.order,
          isActive: classInfo.isActive
        },
        fees: studentFees,
        scholarships: studentScholarships,
        totals,
        feeStatus,
        migrationData: createMigrationData('student_year', row.id, {
          originalStudentId: row.student_id,
          originalCommonFee: row.common_fee,
          originalPaidFee: row.paid_fee,
          originalSection: row.section,
          originalTotal: row.total,
          originalScholarship: row.scholorship,
          feeItemsCount: studentFees.length,
          scholarshipItemsCount: studentScholarships.length,
          netAmountDue: totals.netAmount.due,
          hadScholarship: row.scholorship > 0,
          className: classInfo.className,
          commonFeeData: {
            id: commonFeeData.id,
            schoolFee: parseFloat(commonFeeData.school_fee),
            bookFee: parseFloat(commonFeeData.book_fee),
            classId: commonFeeData.class_id
          }
        })
      }
    });
    
    // Map student_year.id to enrollment.id for payment migration
    studentYearToEnrollmentMap.set(row.id.toString(), enrollment.id);
  }
  
  console.log('✅ Student Enrollments migrated');
  return studentYearToEnrollmentMap;
}


async function migratePayments(csvData: CSVData) {
  console.log('🔄 Migrating Payments...');

  console.log(`input data count: ${csvData.feeTxn.length}`);
  
  // Create a map from enrollment ID to enrollment object for quick lookup
  const enrollments = await prisma.studentEnrollment.findMany();
  const enrollmentByIdMap = new Map(enrollments.map(e => [(e.migrationData as any)?.sourceId, e]));
  
  // Initialize receipt sequence
  const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (academicYear) {
    await prisma.receiptSequence.upsert({
      where: { academicYear: academicYear.year },
      update: {},
      create: {
        academicYear: academicYear.year,
        lastSequence: 0
      }
    });
  }
  
  for (const row of csvData.feeTxn) {
    console.log(`processing row: ${row.student_id}`);
    const enrollment = enrollmentByIdMap.get(row.student_id.toString());
    if (!enrollment) {
        console.warn(`Enrollment not found for enrollment_id: ${row.student_id}`);
        continue;
      }
    
    if (enrollment) {
      // Create payment items based on the fee transaction
      const paymentItems = [];
      
      if (row.school_fee > 0) {
        const schoolFee = enrollment.fees.find(f => f.templateName === 'School Fee');
        if (schoolFee) {
          paymentItems.push({
            id: schoolFee.id,
            feeId: schoolFee.id,
            feeTemplateId: schoolFee.templateId,
            feeTemplateName: schoolFee.templateName,
            amount: parseFloat(row.school_fee),
            feeBalance: Math.max(0, schoolFee.amountDue - parseFloat(row.school_fee))
          });
        }
      }
      
      if (row.book_fee > 0) {
        const bookFee = enrollment.fees.find(f => f.templateName === 'Book Fee');
        if (bookFee) {
          paymentItems.push({
            id: bookFee.id,
            feeId: bookFee.id,
            feeTemplateId: bookFee.templateId,
            feeTemplateName: bookFee.templateName,
            amount: parseFloat(row.book_fee),
            feeBalance: Math.max(0, bookFee.amountDue - parseFloat(row.book_fee))
          });
        }
      }
      
      if (row.uniform_fee > 0) {
        const uniformFee = enrollment.fees.find(f => f.templateName === 'Uniform Fee');
        if (uniformFee) {
          paymentItems.push({
            id: uniformFee.id,
            feeId: uniformFee.id,
            feeTemplateId: uniformFee.templateId,
            feeTemplateName: uniformFee.templateName,
            amount: parseFloat(row.uniform_fee),
            feeBalance: Math.max(0, uniformFee.amountDue - parseFloat(row.uniform_fee))
          });
        }
      }
      
      if (row.van_fee > 0) {
        const vanFee = enrollment.fees.find(f => f.templateName === 'Van Fee');
        if (vanFee) {
          paymentItems.push({
            id: vanFee.id,
            feeId: vanFee.id,
            feeTemplateId: vanFee.templateId,
            feeTemplateName: vanFee.templateName,
            amount: parseFloat(row.van_fee),
            feeBalance: Math.max(0, vanFee.amountDue - parseFloat(row.van_fee))
          });
        }
      }
      
      // const receiptNo = `${enrollment.academicYear.year.split('-')[0]}${String(newSequence).padStart(4, '0')}`;
      
      await prisma.payment.create({
        data: {
          receiptNo: row.id.toString(),
          studentEnrollmentId: enrollment.id,
          totalAmount: parseFloat(row.amount_paid),
          paymentDate: new Date(row.payment_date),
          paymentMethod: 'CASH',
          createdBy: 'system',
          status: 'COMPLETED',
          student: enrollment.student,
          academicYear: enrollment.academicYear,
          paymentItems,
          migrationData: createMigrationData('fee_txn', row.id, {
            originalStudentYearId: row.student_id,
            originalAmountPaid: parseFloat(row.amount_paid),
            originalPaymentDate: row.payment_date,
            feeBreakdown: {
              schoolFee: parseFloat(row.school_fee || 0),
              bookFee: parseFloat(row.book_fee || 0),
              uniformFee: parseFloat(row.uniform_fee || 0),
              islamicStudies: parseFloat(row.islamic_studies || 0),
              vanFee: parseFloat(row.van_fee || 0)
            },
            paymentItemsCount: paymentItems.length,
            generatedReceiptNo: row.id.toString()
          })
        }
      });
    }
  }
  
  console.log('✅ Payments migrated');
}

async function updateEnrollmentTotals() {
  console.log('🔄 Updating enrollment totals...');
  
  const enrollments = await prisma.studentEnrollment.findMany({
    include: { payments: true }
  });
  
  for (const enrollment of enrollments) {
    // Calculate total paid amounts
    const totalPaid = enrollment.payments.reduce((sum, payment) => sum + payment.totalAmount, 0);
    
    // Update fees with paid amounts
    const updatedFees = enrollment.fees.map(fee => {
      const paidAmount = enrollment.payments
        .flatMap(p => p.paymentItems)
        .filter(item => item.feeTemplateId === fee.templateId)
        .reduce((sum, item) => sum + item.amount, 0);
      
      return {
        ...fee,
        amountPaid: paidAmount,
        amountDue: Math.max(0, fee.amount - paidAmount)
      };
    });
    
    // Update totals
    const totalFeeAmount = updatedFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalFeePaid = updatedFees.reduce((sum, fee) => sum + fee.amountPaid, 0);
    const totalFeeDue = updatedFees.reduce((sum, fee) => sum + fee.amountDue, 0);
    const totalScholarshipAmount = enrollment.scholarships.reduce((sum, s) => sum + s.amount, 0);
    
    const updatedTotals = {
      fees: {
        total: totalFeeAmount,
        paid: totalFeePaid,
        due: totalFeeDue
      },
      scholarships: {
        applied: totalScholarshipAmount
      },
      netAmount: {
        total: totalFeeAmount - totalScholarshipAmount,
        paid: totalFeePaid,
        due: Math.max(0, (totalFeeAmount - totalScholarshipAmount) - totalFeePaid)
      }
    };
    
    const feeStatus = {
      status: totalFeeDue === 0 ? 'PAID' : totalFeePaid > 0 ? 'PARTIAL' : 'OVERDUE',
      lastPaymentDate: enrollment.payments.length > 0 ? 
        new Date(Math.max(...enrollment.payments.map(p => p.paymentDate.getTime()))) : null,
      nextDueDate: null,
      overdueAmount: updatedTotals.netAmount.due
    } as any;
    
    await prisma.studentEnrollment.update({
      where: { id: enrollment.id },
      data: {
        fees: updatedFees,
        totals: updatedTotals,
        feeStatus
      }
    });
  }
  
  console.log('✅ Enrollment totals updated');
}


// async function createDefaultUser() {
//   console.log('🔄 Creating default admin user...');
  
//   const bcrypt = await import('bcrypt');
//   const hashedPassword = await bcrypt.hash('admin123', 10);
  
//   await prisma.user.upsert({
//     where: { username: 'admin' },
//     update: {},
//     create: {
//       username: 'admin',
//       email: 'admin@bluemoon.edu',
//       password: hashedPassword,
//       role: 'ADMIN',
//       isActive: true
//     }
//   });
  
//   console.log('✅ Default admin user created (username: admin, password: admin123)');
// }

// Main migration function
async function main() {
  console.log('🚀 Starting data migration...');
  
  try {
    // Load CSV data
    console.log('📊 Loading CSV data...');
    const csvData = loadCSVData();
    console.log('✅ CSV data loaded');
    
    // Run migrations in sequence
    // await migrateAcademicYears(csvData.academicYear);
    // await migrateClasses(csvData.classInfo);
    // await createDefaultFeeTemplates();
    // await createDefaultScholarshipTemplates();
    // await migrateStudents(csvData.studentsInfo);
    // await createFeeStructures(csvData);
    // const studentYearToEnrollmentMap = await migrateStudentEnrollments(csvData);
    // await migratePayments(csvData);
    await updateEnrollmentTotals();
    // await validateMigrationTracking();
    // await createDefaultUser();
    
    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   Academic Years: ${csvData.academicYear.length}`);
    console.log(`   Classes: ${csvData.classInfo.length}`);
    console.log(`   Students: ${csvData.studentsInfo.length}`);
    console.log(`   Student Enrollments: ${csvData.studentYear.length}`);
    console.log(`   Fee Transactions: ${csvData.feeTxn.length}`);
    console.log('\n🔐 Default admin user created:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  main();
}

export { main as migrate };