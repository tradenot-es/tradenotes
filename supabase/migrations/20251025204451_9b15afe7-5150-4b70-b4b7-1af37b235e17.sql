-- Add setup_checklist_completed column to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS setup_checklist_completed boolean[] DEFAULT '{}';

-- Update user_settings to support setup checklists
-- We'll store setups as JSONB to support name + checklist items
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS setup_definitions jsonb DEFAULT '[]'::jsonb;

-- Migrate existing setups to new format
-- This converts existing string arrays to JSONB format with empty checklists
UPDATE user_settings 
SET setup_definitions = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'name', setup_name,
      'checklist', '[]'::jsonb
    )
  )
  FROM unnest(setups) AS setup_name
)
WHERE setup_definitions = '[]'::jsonb AND setups IS NOT NULL AND array_length(setups, 1) > 0;