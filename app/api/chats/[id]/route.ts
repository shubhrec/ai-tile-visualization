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

export async function GET(
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

    const chatId = params.id
    const supabase = getSupabaseClient(token)

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', userId)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    const { data: images, error: imagesError } = await supabase
      .from('generated_images')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })

    if (imagesError) {
      console.error('Error fetching generated images:', imagesError)
    }

    return NextResponse.json({
      chat,
      images: images || []
    }, { status: 200 })
  } catch (err) {
    console.error('GET /api/chats/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const chatId = params.id
    const body = await request.json()
    const { name } = body

    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('chats')
      .update({
        name,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating chat:', error)
      return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 })
    }

    return NextResponse.json({ success: true, chat: data }, { status: 200 })
  } catch (err) {
    console.error('PATCH /api/chats/[id] error:', err)
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

    const chatId = params.id
    const supabase = getSupabaseClient(token)

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting chat:', error)
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/chats/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
