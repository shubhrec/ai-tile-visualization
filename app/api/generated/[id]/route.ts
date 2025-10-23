import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabaseClient(token: string) {
  return createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const imageId = params.id
    const body = await request.json()
    const { kept } = body

    const supabase = getSupabaseClient(token)

    const { data: image } = await supabase
      .from('generated_images')
      .select('chat_id')
      .eq('id', imageId)
      .single()

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('id', image.chat_id)
      .eq('user_id', userId)
      .single()

    if (!chat) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: any = {}
    if (kept !== undefined) {
      updateData.kept = kept
    }

    const { data, error } = await supabase
      .from('generated_images')
      .update(updateData)
      .eq('id', imageId)
      .select()
      .single()

    if (error) {
      console.error('Error updating generated image:', error)
      return NextResponse.json({ error: 'Failed to update image' }, { status: 500 })
    }

    return NextResponse.json({ success: true, image: data }, { status: 200 })
  } catch (err) {
    console.error('PATCH /api/generated/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const userId = getUserIdFromToken(token)

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const imageId = params.id
    const supabase = getSupabaseClient(token)

    const { data: image } = await supabase
      .from('generated_images')
      .select('chat_id')
      .eq('id', imageId)
      .single()

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const { data: chat } = await supabase
      .from('chats')
      .select('id')
      .eq('id', image.chat_id)
      .eq('user_id', userId)
      .single()

    if (!chat) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error deleting generated image:', error)
      return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/generated/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
