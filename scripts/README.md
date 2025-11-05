# Database Management Scripts

This folder contains utility scripts for managing the SomniaX agent database.

## cleanup-agents.ts

Cleanup script to remove agents from the Supabase database.

### Prerequisites

Install tsx if you haven't already:
```bash
npm install -D tsx
```

### Usage

**List all agents (dry run):**
```bash
npx tsx scripts/cleanup-agents.ts
```

**Clean specific agents by slug:**
```bash
npx tsx scripts/cleanup-agents.ts agent-slug-1 agent-slug-2
```

### Safety Features

The script runs in **safety mode** by default and will only show what would be deleted. 

To actually delete agents:
1. Open `scripts/cleanup-agents.ts`
2. Find the commented delete code sections
3. Uncomment the delete statements
4. Run the script again

### Using Supabase Dashboard (Recommended)

For a safer approach, use the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Select the `agents` table
4. Manually select and delete unwanted rows

Or use SQL Editor:
```sql
-- View all agents
SELECT * FROM agents;

-- Delete specific agent by slug
DELETE FROM agents WHERE slug = 'agent-slug-here';

-- Delete all agents (USE WITH CAUTION!)
DELETE FROM agents;
```

## Notes

- Always backup your data before running cleanup scripts
- The app now only shows registered agents from Supabase
- Mock agents have been removed from the codebase
- All new registered agents appear immediately in the directory
