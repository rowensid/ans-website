import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Compress image using canvas (client-side would be better, but this is server-side fallback)
async function compressImage(buffer: Buffer, mimeType: string, quality: number = 0.7): Promise<string> {
  // For now, just convert to base64 with size info
  // In production, you might want to use sharp library for better compression
  const base64 = buffer.toString('base64')
  
  // Check if image is too large (>500KB after compression)
  const sizeInKB = Math.round((base64.length * 0.75) / 1024)
  if (sizeInKB > 500) {
    throw new Error(`Image too large after compression: ${sizeInKB}KB. Maximum allowed is 500KB.`)
  }
  
  return `data:${mimeType};base64,${base64}`
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' 
      }, { status: 400 })
    }

    // Validate file size (max 2MB before compression)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size must be less than 2MB before compression' 
      }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      // Compress and convert to base64
      const compressedBase64 = await compressImage(buffer, file.type, 0.7)
      
      // Update user avatar in database with base64 data
      await db.user.update({
        where: { id: decoded.userId },
        data: {
          avatar: compressedBase64,
          updatedAt: new Date()
        }
      })

      return NextResponse.json({ 
        message: 'Avatar uploaded successfully',
        avatar: compressedBase64,
        size: Math.round((compressedBase64.length * 0.75) / 1024) // size in KB
      })

    } catch (compressionError: any) {
      return NextResponse.json({ 
        error: compressionError.message || 'Failed to compress image' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Upload avatar error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Remove avatar from database (set to null)
    await db.user.update({
      where: { id: decoded.userId },
      data: {
        avatar: null,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Avatar removed successfully'
    })

  } catch (error) {
    console.error('Remove avatar error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 })
  }
}