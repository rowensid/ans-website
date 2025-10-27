import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('Debug: Checking database...')
    
    // Check users
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        createdAt: true,
      },
      take: 5
    })
    
    console.log('Users found:', users.length)
    
    // Check sessions
    const sessions = await db.session.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      take: 5
    })
    
    console.log('Sessions found:', sessions.length)
    
    // Check orders
    const orders = await db.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        storeItem: true,
      },
      take: 5
    })
    
    console.log('Orders found:', orders.length)
    
    return NextResponse.json({
      users: users.map(u => ({ ...u, password: undefined })),
      sessions: sessions.map(s => ({
        id: s.id,
        token: s.token.substring(0, 10) + '...',
        expiresAt: s.expiresAt,
        user: s.user
      })),
      orders: orders.map(o => ({
        id: o.id,
        amount: o.amount,
        status: o.status,
        user: o.user,
        storeItem: o.storeItem ? {
          id: o.storeItem.id,
          title: o.storeItem.title,
          price: o.storeItem.price
        } : null
      }))
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}