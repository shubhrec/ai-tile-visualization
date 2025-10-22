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

    const homeId = params.id

    if (!homeId) {
      return NextResponse.json({ error: 'Home ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient(token)

    const { data, error } = await supabase
      .from('homes')
      .select('*')
      .eq('id', homeId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Home not found' }, { status: 404 })
    }

    return NextResponse.json({ home: data }, { status: 200 })
  } catch (err) {
    console.error('GET /api/homes/[id] error:', err)
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

    const homeId = params.id

    if (!homeId) {
      return NextResponse.json({ error: 'Home ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseClient(token)

    const { error } = await supabase
      .from('homes')
      .delete()
      .eq('id', homeId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting home:', error)
      return NextResponse.json({ error: 'Failed to delete home' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/homes/[id] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
