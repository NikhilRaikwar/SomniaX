import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Agent type definition
export interface Agent {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price_per_query: number
  payment_wallet: string
  creator_wallet: string
  status: string
  created_at: string
  updated_at: string
}

// Agent API functions
export const agentAPI = {
  // Get all agents
  async getAll() {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Agent[]
  },

  // Get agent by slug
  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data as Agent
  },

  // Check if agent name/slug exists
  async checkSlugAvailability(slug: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('slug')
      .eq('slug', slug)
      .single()
    
    // If no data found, slug is available
    return !data
  },

  // Create new agent
  async create(agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('agents')
      .insert([agent])
      .select()
      .single()
    
    if (error) throw error
    return data as Agent
  },

  // Update agent
  async update(id: string, updates: Partial<Agent>) {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Agent
  },

  // Get agents by category
  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Agent[]
  },

  // Get agents by creator wallet
  async getByCreator(creatorWallet: string) {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('creator_wallet', creatorWallet)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Agent[]
  },

  // Delete agent (only creator can delete)
  async delete(id: string, creatorWallet: string) {
    // First verify the creator
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('creator_wallet')
      .eq('id', id)
      .single()

    if (fetchError || !agent) {
      throw new Error('Agent not found')
    }

    if (agent.creator_wallet.toLowerCase() !== creatorWallet.toLowerCase()) {
      throw new Error('Unauthorized: You can only delete your own agents')
    }

    // Delete the agent
    const { error: deleteError } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError
    return { success: true }
  }
}
