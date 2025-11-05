/**
 * Cleanup Script for Agent Database
 * 
 * This script removes all agents from the Supabase database.
 * Use this to clean up test/mock agents and start fresh.
 * 
 * Run with: npx tsx scripts/cleanup-agents.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function cleanupAgents() {
  try {
    console.log('🔍 Fetching all agents from database...')
    
    // Get all agents
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('*')
    
    if (fetchError) {
      throw fetchError
    }

    if (!agents || agents.length === 0) {
      console.log('✅ Database is already clean. No agents found.')
      return
    }

    console.log(`\n📊 Found ${agents.length} agent(s) in database:`)
    agents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} (${agent.slug}) - Created by: ${agent.creator_wallet?.slice(0, 10)}...`)
    })

    console.log('\n⚠️  This will DELETE ALL agents from the database!')
    console.log('⚠️  This action CANNOT be undone!\n')

    // In a real script, you'd want user confirmation here
    // For safety, we'll just log what would be deleted
    console.log('🗑️  To actually delete, uncomment the delete code in the script.\n')

    // UNCOMMENT THE FOLLOWING CODE TO ACTUALLY DELETE:
    /*
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
    
    if (deleteError) {
      throw deleteError
    }

    console.log('✅ Successfully deleted all agents from database!')
    */

    console.log('ℹ️  No agents were deleted (safety mode enabled)')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

async function cleanupSpecificAgents(slugs: string[]) {
  try {
    console.log(`🔍 Cleaning up specific agents: ${slugs.join(', ')}`)
    
    const { data: agents, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .in('slug', slugs)
    
    if (fetchError) {
      throw fetchError
    }

    if (!agents || agents.length === 0) {
      console.log('✅ No matching agents found.')
      return
    }

    console.log(`\n📊 Found ${agents.length} matching agent(s):`)
    agents.forEach((agent, index) => {
      console.log(`   ${index + 1}. ${agent.name} (${agent.slug})`)
    })

    // UNCOMMENT TO ACTUALLY DELETE:
    /*
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .in('slug', slugs)
    
    if (deleteError) {
      throw deleteError
    }

    console.log('✅ Successfully deleted specified agents!')
    */

    console.log('ℹ️  No agents were deleted (safety mode enabled)')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    // Clean all agents
    await cleanupAgents()
  } else {
    // Clean specific agents by slug
    await cleanupSpecificAgents(args)
  }
}

main()
