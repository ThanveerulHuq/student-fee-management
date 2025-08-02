import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@bluemoon.com',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Admin user created:', admin)

  // Create sample academic year
  const currentYear = new Date()
  const nextYear = new Date(currentYear.getFullYear() + 1, currentYear.getMonth(), currentYear.getDate())
  
  const academicYear = await prisma.academicYear.upsert({
    where: { year: '2024-25' },
    update: {},
    create: {
      year: '2024-25',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2025-05-31'),
      isActive: true,
    },
  })

  console.log('Academic year created:', academicYear)

  // Create sample classes
  const classes = [
    { className: '1st', order: 1 },
    { className: '2nd', order: 2 },
    { className: '3rd', order: 3 },
    { className: '4th', order: 4 },
    { className: '5th', order: 5 },
    { className: '6th', order: 6 },
    { className: '7th', order: 7 },
    { className: '8th', order: 8 },
    { className: '9th', order: 9 },
    { className: '10th', order: 10 },
  ]

  for (const classData of classes) {
    const classRecord = await prisma.class.upsert({
      where: { className: classData.className },
      update: {},
      create: classData,
    })
    console.log(`Class created: ${classRecord.className}`)

  }

  console.log('Seed data completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })