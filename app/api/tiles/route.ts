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
      .from('tiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tiles:', error)
      return NextResponse.json({ error: 'Failed to fetch tiles' }, { status: 500 })
    }

    return NextResponse.json({ tiles: data || [] })
  } catch (err) {
    console.error('GET /api/tiles error:', err)
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
    const { image_url, name, size, price } = body

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient(token)

    const insertData: any = {
      user_id: userId,
      image_url,
      name: name || '',
    }

    if (size) {
      insertData.size = size
    }

    if (price !== undefined && price !== null) {
      insertData.price = price
    }

    const { data, error } = await supabase
      .from('tiles')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tile:', error)
      return NextResponse.json({ error: 'Failed to create tile' }, { status: 500 })
    }

    return NextResponse.json({ tile: data }, { status: 201 })
  } catch (err) {
    console.error('POST /api/tiles error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
