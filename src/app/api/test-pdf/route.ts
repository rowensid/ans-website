import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function GET() {
  try {
    console.log('Test PDF generation...')
    
    // Create simple PDF
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Add some content
    pdf.setFontSize(24)
    pdf.setFont(undefined, 'bold')
    pdf.text('Test Invoice', 20, 30)
    
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text('This is a test PDF to verify generation works.', 20, 50)
    pdf.text('Generated at: ' + new Date().toLocaleString(), 20, 70)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    console.log('Test PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    
    // Create response
    const response = new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-invoice.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
    
    return response

  } catch (error) {
    console.error('Error generating test PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate test PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}