-- Add ReAct agent columns to demos table
ALTER TABLE demos ADD COLUMN IF NOT EXISTS revenue_leaks JSONB;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS react_analysis JSONB;

-- Create ReAct agent steps table for detailed logging
CREATE TABLE IF NOT EXISTS react_agent_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  demo_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  thought TEXT,
  action TEXT,
  action_input JSONB,
  observation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (demo_id) REFERENCES demos(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_react_steps_demo_agent ON react_agent_steps(demo_id, agent_name);