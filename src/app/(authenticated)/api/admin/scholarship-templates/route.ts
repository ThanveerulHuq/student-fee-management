import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/scholarship-templates - List all scholarship templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.scholarshipTemplate.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching scholarship templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scholarship templates' },
      { status: 500 }
    )
  }
}

// POST /api/admin/scholarship-templates - Create new scholarship template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, type, order } = body

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      )
    }

    // Check if template with same name exists
    const existingTemplate = await prisma.scholarshipTemplate.findUnique({
      where: { name }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Scholarship template with this name already exists' },
        { status: 409 }
      )
    }

    // Auto-assign order if not provided
    let templateOrder = order
    if (!templateOrder) {
      const lastTemplate = await prisma.scholarshipTemplate.findFirst({
        orderBy: { order: 'desc' }
      })
      templateOrder = (lastTemplate?.order || 0) + 1
    }

    const template = await prisma.scholarshipTemplate.create({
      data: {
        name,
        description,
        type,
        order: templateOrder,
        isActive: true
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating scholarship template:', error)
    return NextResponse.json(
      { error: 'Failed to create scholarship template' },
      { status: 500 }
    )
  }
}