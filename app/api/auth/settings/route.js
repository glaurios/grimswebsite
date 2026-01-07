import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const resp = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: 'no-store',
    })

    const json = await resp.json()

    return NextResponse.json({
      ok: resp.ok,
      status: resp.status,
      projectUrlHost: new URL(supabaseUrl).host,
      raw: json,
    }, { status: resp.ok ? 200 : resp.status })
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

