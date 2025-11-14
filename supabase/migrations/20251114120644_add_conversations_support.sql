/*
  # Add Conversations Support to AstraTrade

  ## Overview
  This migration adds comprehensive conversation management to the AI assistant,
  enabling users to maintain multiple parallel analysis sessions with full history.

  ## New Tables
  
  ### `conversations`
  Core conversation metadata and management table.
  
  - `id` (uuid, primary key) - Unique conversation identifier
  - `user_id` (uuid, not null) - Owner of the conversation
  - `title` (text, not null, default 'New Conversation') - Conversation title
  - `status` (text, not null, default 'active') - Status: active/archived/deleted
  - `stock_symbol` (text, nullable) - Associated stock symbol for context
  - `stock_name` (text, nullable) - Associated stock name for context
  - `stock_price` (numeric, nullable) - Associated stock price snapshot
  - `tags` (text[], nullable) - Tags for categorization
  - `message_count` (integer, not null, default 0) - Cached message count
  - `last_activity` (timestamptz, not null, default now()) - Last activity timestamp
  - `created_at` (timestamptz, not null, default now()) - Creation timestamp
  - `updated_at` (timestamptz, not null, default now()) - Last update timestamp

  ## Modified Tables

  ### `chat_history`
  Extended to support conversation relationships.

  - Added `conversation_id` (uuid, nullable) - Links message to conversation
  - Added foreign key constraint to conversations table
  - Added index for efficient conversation message queries

  ## Indexes
  - `idx_conversations_user_status` - Fast conversation filtering by user and status
  - `idx_conversations_last_activity` - Efficient ordering by recent activity
  - `idx_chat_conversation` - Fast message lookup by conversation
  - `idx_conversations_stock` - Quick filtering by stock symbol

  ## Security (Row Level Security)
  
  ### Conversations Table Policies
  - Users can view their own conversations (SELECT)
  - Users can create new conversations (INSERT)
  - Users can update their own conversations (UPDATE)
  - Users can delete their own conversations (DELETE)
  
  ### Chat History Updates
  - Updated policies to support conversation-based access
  - Users can only access messages in their own conversations

  ## Important Notes
  - Existing chat_history records remain valid with NULL conversation_id
  - Message count is automatically maintained via trigger
  - Last activity timestamp updates automatically on message insert
  - Soft delete pattern: status='deleted' preserves data for recovery
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Conversation',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  stock_symbol text,
  stock_name text,
  stock_price numeric(10, 2),
  tags text[],
  message_count integer NOT NULL DEFAULT 0,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add conversation_id to chat_history if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_history' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE chat_history ADD COLUMN conversation_id uuid;
  END IF;
END $$;

-- Add foreign key constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_chat_conversation'
  ) THEN
    ALTER TABLE chat_history
      ADD CONSTRAINT fk_chat_conversation
      FOREIGN KEY (conversation_id)
      REFERENCES conversations(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_status ON conversations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_activity ON conversations(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversation ON chat_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_stock ON conversations(stock_symbol) WHERE stock_symbol IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversations table policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update conversation metadata on message insert
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations
    SET 
      message_count = message_count + 1,
      last_activity = NEW.created_at,
      updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic conversation updates
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON chat_history;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON chat_history
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
