-- Direct Messages: conversations + messages

CREATE TABLE IF NOT EXISTS dm_conversations (
  id TEXT PRIMARY KEY DEFAULT 'conv-' || gen_random_uuid()::text,
  user_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)  -- enforce ordering to prevent duplicates
);

CREATE INDEX idx_dm_conv_users ON dm_conversations(user_a_id);
CREATE INDEX idx_dm_conv_users_b ON dm_conversations(user_b_id);

CREATE TABLE IF NOT EXISTS dm_messages (
  id TEXT PRIMARY KEY DEFAULT 'msg-' || gen_random_uuid()::text,
  conversation_id TEXT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dm_messages_conv ON dm_messages(conversation_id, created_at DESC);

ALTER TABLE dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own conversations" ON dm_conversations FOR SELECT
  USING (auth.uid() = user_a_id OR auth.uid() = user_b_id);
CREATE POLICY "Auth create conversations" ON dm_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_a_id OR auth.uid() = user_b_id);

CREATE POLICY "Conversation members read" ON dm_messages FOR SELECT
  USING (EXISTS(
    SELECT 1 FROM dm_conversations c
    WHERE c.id = conversation_id
    AND (auth.uid() = c.user_a_id OR auth.uid() = c.user_b_id)
  ));
CREATE POLICY "Auth send messages" ON dm_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Own update messages" ON dm_messages FOR UPDATE
  USING (EXISTS(
    SELECT 1 FROM dm_conversations c
    WHERE c.id = conversation_id
    AND (auth.uid() = c.user_a_id OR auth.uid() = c.user_b_id)
  ));

ALTER PUBLICATION supabase_realtime ADD TABLE dm_messages;

-- Helper: get or create conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(p_user_a UUID, p_user_b UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_a UUID;
  v_b UUID;
  v_conv_id TEXT;
BEGIN
  -- Enforce ordering
  IF p_user_a < p_user_b THEN
    v_a := p_user_a; v_b := p_user_b;
  ELSE
    v_a := p_user_b; v_b := p_user_a;
  END IF;

  -- Find existing
  SELECT id INTO v_conv_id FROM dm_conversations
  WHERE user_a_id = v_a AND user_b_id = v_b;

  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Create new
  INSERT INTO dm_conversations (user_a_id, user_b_id)
  VALUES (v_a, v_b)
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$$;
