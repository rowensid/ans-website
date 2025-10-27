import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { generateOrderId } from '@/lib/id-generator'

export async function POST() {
  try {
    console.log('Fixing orders with empty IDs...')
    
    // Find all orders with empty IDs
    const ordersWithEmptyId = await db.order.findMany({
      where: { id: '' }
    })
    
    console.log(`Found ${ordersWithEmptyId.length} orders with empty IDs`)
    
    let fixedCount = 0
    
    for (const order of ordersWithEmptyId) {
      try {
        const newId = generateOrderId()
        
        // Update order with new ID
        await db.order.update({
          where: { id: order.id },
          data: { id: newId }
        })
        
        console.log(`Fixed order: ${newId}`)
        fixedCount++
        
      } catch (error) {
        console.error(`Failed to fix order ${order.id}:`, error)
      }
    }
    
    return NextResponse.json({
      message: `Fixed ${fixedCount} orders`,
      totalFound: ordersWithEmptyId.length,
      fixed: fixedCount
    })

  } catch (error) {
    console.error('Error fixing orders:', error)
    return NextResponse.json(
      { error: 'Failed to fix orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}