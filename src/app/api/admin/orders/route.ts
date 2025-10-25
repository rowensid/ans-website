import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find session by token
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (!['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin or owner required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'all'
    const userId = searchParams.get('userId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status !== 'all') {
      where.status = status
    }
    
    if (userId) {
      where.userId = userId
    }

    // Get total count
    const total = await db.order.count({ where })

    // Get orders with user and service info
    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        storeItem: {
          select: {
            title: true,
            category: true,
            description: true
          }
        },
        service: {
          select: {
            name: true,
            type: true,
            status: true,
            config: true
          }
        }
      }
    })

    const pages = Math.ceil(total / limit)

    // Format orders
    const formattedOrders = orders.map(order => ({
      id: order.id,
      user: order.user,
      service: order.storeItem ? {
        name: order.storeItem.title,
        type: order.storeItem.category,
        description: order.storeItem.description,
        status: null,
        config: null
      } : order.service || {
        name: 'Unknown Service',
        type: 'UNKNOWN',
        status: null,
        config: null
      },
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentProof: order.paymentProof,
      adminNotes: order.adminNotes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString()
    }))

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        pages
      }
    })

  } catch (error) {
    console.error('Failed to fetch admin orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find session by token
    const session = await db.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    if (!['ADMIN', 'OWNER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Access denied. Admin or owner required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { orderId, status, adminNotes } = body

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Order ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['PENDING', 'VALIDATING', 'COMPLETED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get order with service info
    const existingOrder = await db.order.findUnique({
      where: { id: orderId },
      include: { service: true }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { 
        status,
        adminNotes: adminNotes || null,
        updatedAt: new Date()
      }
    })

    // If order has associated service, update service status too
    if (existingOrder.service) {
      let serviceStatus = 'PENDING'
      if (status === 'COMPLETED') {
        serviceStatus = 'ACTIVE'
      } else if (status === 'CANCELLED') {
        serviceStatus = 'CANCELLED'
      }

      await db.service.update({
        where: { id: existingOrder.service.id },
        data: { 
          status: serviceStatus,
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      message: 'Order status updated successfully',
      order: updatedOrder
    })

  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}