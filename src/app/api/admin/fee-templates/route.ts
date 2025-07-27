import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/admin/fee-templates - List all fee templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.feeTemplate.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching fee templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fee templates' },
      { status: 500 }
    )
  }
}

// POST /api/admin/fee-templates - Create new fee template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, order } = body

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    // Check if template with same name exists
    const existingTemplate = await prisma.feeTemplate.findUnique({
      where: { name }
    })

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Fee template with this name already exists' },
        { status: 409 }
      )
    }

    // Auto-assign order if not provided
    let templateOrder = order
    if (!templateOrder) {
      const lastTemplate = await prisma.feeTemplate.findFirst({
        orderBy: { order: 'desc' }
      })
      templateOrder = (lastTemplate?.order || 0) + 1
    }

    const template = await prisma.feeTemplate.create({
      data: {
        name,
        description,
        category,
        order: templateOrder,
        isActive: true
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating fee template:', error)
    return NextResponse.json(
      { error: 'Failed to create fee template' },
      { status: 500 }
    )
  }
}