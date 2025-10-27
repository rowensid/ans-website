import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

export async function GET() {
  try {
    console.log('Test invoice PDF with database...')
    
    // Get any order from database
    const order = await db.order.findFirst({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        storeItem: true,
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'No orders found in database' }, { status: 404 })
    }

    console.log('Found order:', order.id, 'creating PDF...')
    
    // Create PDF using same logic as invoice API
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor = [99, 102, 241] // Indigo
    const secondaryColor = [107, 114, 128] // Gray
    
    // Helper functions
    const setColor = (color: number[]) => pdf.setTextColor(...color)
    const setFillColor = (color: number[]) => pdf.setFillColor(...color)
    
    // Header Background
    setFillColor(primaryColor)
    pdf.rect(0, 0, pageWidth, 80, 'F')
    
    // Company Info
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    setColor([255, 255, 255])
    pdf.text('TEST INVOICE', 20, 30)
    
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    setColor([255, 255, 255])
    pdf.text('Test Company', 20, 40)
    pdf.text('Jl. Test No. 123, Jakarta, Indonesia', 20, 47)
    
    // Invoice Details
    setColor([255, 255, 255])
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.text('INVOICE #', pageWidth - 80, 30)
    pdf.setFont(undefined, 'normal')
    pdf.text(order.id, pageWidth - 80, 37)
    
    pdf.text('Date:', pageWidth - 80, 47)
    pdf.text(new Date(order.createdAt).toLocaleDateString('id-ID'), pageWidth - 80, 54)
    
    // Billing Information
    let yPosition = 100
    setColor(primaryColor)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('Bill To:', 20, yPosition)
    
    yPosition += 10
    setColor(secondaryColor)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    pdf.text(order.user.name, 20, yPosition)
    
    yPosition += 7
    pdf.text(order.user.email, 20, yPosition)
    
    // Order Details
    yPosition += 20
    setColor(primaryColor)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('Order Details:', 20, yPosition)
    
    yPosition += 15
    setColor(secondaryColor)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'normal')
    pdf.text('Item: ' + order.storeItem.title, 20, yPosition)
    
    yPosition += 7
    pdf.text('Price: Rp ' + order.amount.toLocaleString('id-ID'), 20, yPosition)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    console.log('Test invoice PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    
    // Create response
    const response = new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="test-invoice-${order.id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
    
    return response

  } catch (error) {
    console.error('Error generating test invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate test invoice PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}