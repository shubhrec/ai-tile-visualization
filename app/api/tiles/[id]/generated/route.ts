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

    const tileId = params.id

    if (!tileId) {
      return NextResponse.json({ error: 'Tile ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('tile_id', tileId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching generated images:', error)
      return NextResponse.json({ error: 'Failed to fetch generated images' }, { status: 500 })
    }

    return NextResponse.json({ generated: data || [] }, { status: 200 })
  } catch (err) {
    console.error('GET /api/tiles/[id]/generated error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
