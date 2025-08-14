import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/database'
import { authOptions } from '@/lib/auth'

// GET /api/admin/fee-templates - List all fee templates
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.connect()

    const templates = await db.feeTemplate
      .find({})
      .sort({ order: 1, name: 1 })
      .lean()

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

    await db.connect()

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
    const existingTemplate = await db.feeTemplate.findOne({ name })

    if (existingTemplate) {
      return NextResponse.json(
        { error: 'Fee template with this name already exists' },
        { status: 409 }
      )
    }

    // Auto-assign order if not provided
    let templateOrder = order
    if (!templateOrder) {
      const lastTemplate = await db.feeTemplate
        .findOne({})
        .sort({ order: -1 })
        .lean()
      templateOrder = (lastTemplate?.order || 0) + 1
    }

    const template = await db.feeTemplate.create({
      name,
      description,
      category,
      order: templateOrder,
      isActive: true
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