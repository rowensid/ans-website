import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function GET() {
  try {
    console.log('Test simple PDF...')
    
    // Create simple PDF
    const pdf = new jsPDF()
    
    // Add simple text
    pdf.setFontSize(16)
    pdf.text('Test Invoice', 20, 30)
    
    pdf.setFontSize(12)
    pdf.text('This is a test.', 20, 50)
    pdf.text('Date: ' + new Date().toLocaleDateString(), 20, 70)
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    
    console.log('Simple PDF generated successfully, size:', pdfBuffer.length, 'bytes')
    
    // Create response
    const response = new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-simple.pdf"',
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
    
    return response

  } catch (error) {
    console.error('Error generating simple PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate simple PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}