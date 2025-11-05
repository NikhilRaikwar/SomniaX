import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function DELETE(request: NextRequest) {
  try {
    const { agentId, creatorWallet } = await request.json()

    if (!agentId || !creatorWallet) {
      return NextResponse.json(
        { error: 'Agent ID and creator wallet are required' },
        { status: 400 }
      )
    }

    // First, verify the creator wallet matches
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('creator_wallet')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }

    // Check if the wallet matches
    if (agent.creator_wallet.toLowerCase() !== creatorWallet.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own agents' },
        { status: 403 }
      )
    }

    // Delete the agent
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .eq('id', agentId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete agent' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })

  } catch (error) {
    console.error('Delete agent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
