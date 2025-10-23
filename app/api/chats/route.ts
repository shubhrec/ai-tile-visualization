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

export async function GET(request: NextRequest) {
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

    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching chats:', error)
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
    }

    return NextResponse.json({ chats: data || [] }, { status: 200 })
  } catch (err) {
    console.error('GET /api/chats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name } = body

    const supabase = getSupabaseClient(token)

    const chatName = name || `Chat - ${new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })}`

    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        name: chatName,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chat:', error)
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
    }

    return NextResponse.json({ chat: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/chats error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
