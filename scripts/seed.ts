import { db } from '../src/lib/database'
import bcrypt from 'bcryptjs'
import { 
  Role, 
  Gender, 
  FeeCategory, 
  ScholarshipType 
} from '../src/lib/types'

async function main() {
  try {
    console.log('🌱 Starting database seed...')
    
    await db.connect()
    console.log('✅ Connected to MongoDB')

    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await Promise.all([
      db.user.deleteMany({}),
      db.student.deleteMany({}),
      db.academicYear.deleteMany({}),
      db.class.deleteMany({}),
      db.feeTemplate.deleteMany({}),
      db.scholarshipTemplate.deleteMany({}),
      db.feeStructure.deleteMany({}),
      db.studentEnrollment.deleteMany({}),
      db.payment.deleteMany({}),
      db.document.deleteMany({}),
      db.receiptSequence.deleteMany({})
    ])

    // Create admin user
    console.log('👤 Creating admin user...')
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await db.user.create({
      username: 'admin',
      email: 'admin@school.com',
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true
    })
    console.log(`✅ Created admin user: ${adminUser.username}`)

    // Create academic year
    console.log('📅 Creating academic year...')
    const academicYear = await db.academicYear.create({
      year: '2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isActive: true
    })
    console.log(`✅ Created academic year: ${academicYear.year}`)

    // Create classes
    console.log('🏫 Creating classes...')
    const classes = await Promise.all([
      db.class.create({ className: 'LKG', order: 1, isActive: true }),
      db.class.create({ className: 'UKG', order: 2, isActive: true }),
      db.class.create({ className: '1st', order: 3, isActive: true }),
      db.class.create({ className: '2nd', order: 4, isActive: true }),
      db.class.create({ className: '3rd', order: 5, isActive: true }),
      db.class.create({ className: '4th', order: 6, isActive: true }),
      db.class.create({ className: '5th', order: 7, isActive: true })
    ])
    console.log(`✅ Created ${classes.length} classes`)

    // Create fee templates
    console.log('💰 Creating fee templates...')
    const feeTemplates = await Promise.all([
      db.feeTemplate.create({
        name: 'Tuition Fee',
        description: 'Monthly tuition fee',
        category: FeeCategory.REGULAR,
        order: 1,
        isActive: true
      }),
      db.feeTemplate.create({
        name: 'Transport Fee',
        description: 'Monthly transport fee',
        category: FeeCategory.OPTIONAL,
        order: 2,
        isActive: true
      }),
      db.feeTemplate.create({
        name: 'Library Fee',
        description: 'Annual library fee',
        category: FeeCategory.REGULAR,
        order: 3,
        isActive: true
      }),
      db.feeTemplate.create({
        name: 'Sports Fee',
        description: 'Annual sports activities fee',
        category: FeeCategory.ACTIVITY,
        order: 4,
        isActive: true
      }),
      db.feeTemplate.create({
        name: 'Exam Fee',
        description: 'Semester examination fee',
        category: FeeCategory.EXAMINATION,
        order: 5,
        isActive: true
      })
    ])
    console.log(`✅ Created ${feeTemplates.length} fee templates`)

    // Create scholarship templates
    console.log('🎓 Creating scholarship templates...')
    const scholarshipTemplates = await Promise.all([
      db.scholarshipTemplate.create({
        name: 'Merit Scholarship',
        description: 'For students with excellent academic performance',
        type: ScholarshipType.MERIT,
        order: 1,
        isActive: true
      }),
      db.scholarshipTemplate.create({
        name: 'Need-Based Scholarship',
        description: 'For economically disadvantaged students',
        type: ScholarshipType.NEED_BASED,
        order: 2,
        isActive: true
      }),
      db.scholarshipTemplate.create({
        name: 'Government Scholarship',
        description: 'Government sponsored scholarship',
        type: ScholarshipType.GOVERNMENT,
        order: 3,
        isActive: true
      })
    ])
    console.log(`✅ Created ${scholarshipTemplates.length} scholarship templates`)

    // Create sample students
    console.log('👨‍🎓 Creating sample students...')
    const students = await Promise.all([
      db.student.create({
        admissionNo: 'STU001',
        name: 'Aarav Kumar',
        gender: Gender.MALE,
        dateOfBirth: new Date('2015-06-15'),
        community: 'General',
        motherTongue: 'Hindi',
        mobileNumbers: [
          { number: '9876543210', isPrimary: true, isWhatsApp: true, label: 'Father' }
        ],
        fatherName: 'Rajesh Kumar',
        motherName: 'Priya Kumar',
        address: '123 MG Road, Bangalore',
        religion: 'Hindu',
        caste: 'General',
        nationality: 'Indian',
        isActive: true,
        admissionDate: new Date('2024-04-01')
      }),
      db.student.create({
        admissionNo: 'STU002',
        name: 'Ananya Sharma',
        gender: Gender.FEMALE,
        dateOfBirth: new Date('2016-03-20'),
        community: 'General',
        motherTongue: 'English',
        mobileNumbers: [
          { number: '9876543211', isPrimary: true, isWhatsApp: false, label: 'Mother' }
        ],
        fatherName: 'Vikram Sharma',
        motherName: 'Sunita Sharma',
        address: '456 Brigade Road, Bangalore',
        religion: 'Hindu',
        caste: 'General',
        nationality: 'Indian',
        isActive: true,
        admissionDate: new Date('2024-04-02')
      })
    ])
    console.log(`✅ Created ${students.length} sample students`)

    // Create receipt sequence
    console.log('🧾 Creating receipt sequence...')
    await db.receiptSequence.create({
      academicYear: academicYear.year,
      lastSequence: 0
    })
    console.log('✅ Created receipt sequence')

    console.log('🎉 Database seed completed successfully!')
    console.log(`
📊 Summary:
- Users: 1 (admin)
- Academic Years: 1 (${academicYear.year})
- Classes: ${classes.length}
- Fee Templates: ${feeTemplates.length}
- Scholarship Templates: ${scholarshipTemplates.length}
- Students: ${students.length}

🔐 Login credentials:
- Username: admin
- Password: admin123
    `)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()