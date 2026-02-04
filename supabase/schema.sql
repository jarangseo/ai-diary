-- Supabase SQL Schema for AI Diary
-- Run this in your Supabase SQL Editor

-- Create diaries table
CREATE TABLE IF NOT EXISTS diaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  is_record_only BOOLEAN DEFAULT FALSE,
  emotion_primary TEXT,
  emotion_score DECIMAL(3,2),
  emotion_summary TEXT,
  emotion_questions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_diaries_user_id ON diaries(user_id);
CREATE INDEX IF NOT EXISTS idx_diaries_date ON diaries(date);

-- Enable Row Level Security
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own diaries
CREATE POLICY "Users can view own diaries" ON diaries
  FOR SELECT USING (true);

-- Policy: Users can insert their own diaries
CREATE POLICY "Users can insert own diaries" ON diaries
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update their own diaries
CREATE POLICY "Users can update own diaries" ON diaries
  FOR UPDATE USING (true);

-- Policy: Users can delete their own diaries
CREATE POLICY "Users can delete own diaries" ON diaries
  FOR DELETE USING (true);

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row update
DROP TRIGGER IF EXISTS update_diaries_updated_at ON diaries;
CREATE TRIGGER update_diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
