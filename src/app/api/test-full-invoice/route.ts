import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jsPDF from 'jspdf'

export async function GET() {
  try {
    console.log('Test invoice without auth...')
    
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
    
    // Create PDF using exact same logic as invoice API
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Colors
    const primaryColor = [99, 102, 241] // Indigo
    const secondaryColor = [107, 114, 128] // Gray
    const accentColor = [16, 185, 129] // Emerald
    
    // Helper functions
    const setColor = (color: number[]) => pdf.setTextColor(...color)
    const setFillColor = (color: number[]) => pdf.setFillColor(...color)
    
    // Header Background
    setFillColor(primaryColor)
    pdf.rect(0, 0, pageWidth, 80, 'F')
    
    // Company Info (White text on colored background)
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    setColor([255, 255, 255])
    pdf.text('INVOICE', 20, 30)
    
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    setColor([255, 255, 255])
    pdf.text('Your Company Name', 20, 40)
    pdf.text('Jl. Example No. 123, Jakarta, Indonesia', 20, 47)
    pdf.text('Email: support@yourcompany.com', 20, 54)
    pdf.text('Phone: +62 812-3456-7890', 20, 61)
    
    // Invoice Details Box
    const detailsX = pageWidth - 80
    setFillColor([255, 255, 255])
    pdf.rect(detailsX - 10, 20, 70, 50, 'F')
    setFillColor(primaryColor)
    pdf.rect(detailsX - 10, 20, 70, 50)
    
    setColor([255, 255, 255])
    pdf.setFontSize(10)
    pdf.setFont(undefined, 'bold')
    pdf.text('INVOICE #', detailsX, 30)
    pdf.setFont(undefined, 'normal')
    pdf.text(order.id, detailsX, 37)
    
    pdf.text('Date:', detailsX, 47)
    pdf.text(new Date(order.createdAt).toLocaleDateString('id-ID'), detailsX, 54)
    
    pdf.text('Status:', detailsX, 64)
    setColor(accentColor)
    pdf.text(order.status, detailsX, 71)
    
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
    
    yPosition += 7
    pdf.text(`Customer ID: ${order.user.id}`, 20, yPosition)
    
    // Order Items Table
    yPosition += 20
    setColor(primaryColor)
    pdf.setFontSize(14)
    pdf.setFont(undefined, 'bold')
    pdf.text('Order Details:', 20, yPosition)
    
    yPosition += 15
    
    // Table Header
    setFillColor([249, 250, 251])
    pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F')
    setColor(primaryColor)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.text('Description', 25, yPosition)
    pdf.text('Category', 100, yPosition)
    pdf.text('Qty', 150, yPosition)
    pdf.text('Price', 160, yPosition)
    pdf.text('Total', pageWidth - 50, yPosition)
    
    // Table Row
    yPosition += 10
    setFillColor([255, 255, 255])
    pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F')
    setColor(secondaryColor)
    pdf.setFont(undefined, 'normal')
    
    // Truncate text if too long
    const title = order.storeItem.title.length > 30 ? order.storeItem.title.substring(0, 30) + '...' : order.storeItem.title
    pdf.text(title, 25, yPosition)
    pdf.text(order.storeItem.category, 100, yPosition)
    pdf.text('1', 150, yPosition)
    pdf.text(`Rp ${order.amount.toLocaleString('id-ID')}`, 160, yPosition)
    pdf.text(`Rp ${order.amount.toLocaleString('id-ID')}`, pageWidth - 50, yPosition)
    
    // Total Section
    yPosition += 30
    setFillColor([249, 250, 251])
    pdf.rect(pageWidth - 100, yPosition - 5, 80, 60, 'F')
    
    setColor(secondaryColor)
    pdf.setFontSize(11)
    pdf.text('Subtotal:', pageWidth - 90, yPosition)
    pdf.text(`Rp ${order.amount.toLocaleString('id-ID')}`, pageWidth - 30, yPosition)
    
    yPosition += 10
    pdf.text('Tax (0%):', pageWidth - 90, yPosition)
    pdf.text('Rp 0', pageWidth - 30, yPosition)
    
    yPosition += 10
    pdf.setDrawColor(primaryColor)
    pdf.setLineWidth(0.5)
    pdf.line(pageWidth - 90, yPosition + 2, pageWidth - 30, yPosition + 2)
    
    yPosition += 10
    setColor(primaryColor)
    pdf.setFont(undefined, 'bold')
    pdf.setFontSize(12)
    pdf.text('TOTAL:', pageWidth - 90, yPosition)
    pdf.text(`Rp ${order.amount.toLocaleString('id-ID')}`, pageWidth - 30, yPosition)
    
    // Payment Information
    yPosition += 30
    setColor(primaryColor)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'bold')
    pdf.text('Payment Information:', 20, yPosition)
    
    yPosition += 10
    setColor(secondaryColor)
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(10)
    pdf.text(`Payment Method: ${order.paymentMethod}`, 20, yPosition)
    
    yPosition += 7
    pdf.text(`Payment Status: ${order.status}`, 20, yPosition)
    
    // Footer
    yPosition = pageHeight - 40
    setColor(secondaryColor)
    pdf.setFontSize(9)
    pdf.setFont(undefined, 'italic')
    pdf.text('Thank you for your business!', 20, yPosition)
    
    yPosition += 7
    pdf.text('This is a computer-generated invoice and does not require a signature.', 20, yPosition)
    
    // Add border
    pdf.setDrawColor(primaryColor)
    pdf.setLineWidth(1)
    pdf.rect(5, 5, pageWidth - 10, pageHeight - 10)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    console.log('Full invoice PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    
    // Create response
    const response = new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${order.id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
    
    return response

  } catch (error) {
    console.error('Error generating full invoice PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate full invoice PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}