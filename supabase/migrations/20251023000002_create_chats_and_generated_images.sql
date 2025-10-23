/*
  # Create chats and generated_images tables

  1. New Tables
    - `chats`
      - `id` (uuid, primary key) - Unique identifier for each chat
      - `user_id` (uuid, foreign key) - References auth.users
      - `name` (text) - Chat name/title
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

    - `generated_images`
      - `id` (uuid, primary key) - Unique identifier for each generated image
      - `chat_id` (uuid, foreign key) - References chats table
      - `tile_id` (uuid, foreign key) - References tiles table
      - `home_id` (uuid, foreign key, nullable) - References homes table
      - `prompt` (text) - User's generation prompt
      - `image_url` (text) - URL to generated image
      - `kept` (boolean) - Whether user kept the image
      - `created_at` (timestamptz) - Timestamp of creation

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Index on chat_id for faster generated_images queries
    - Index on user_id for faster chat queries
*/

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats"
  ON chats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats"
  ON chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats"
  ON chats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats"
  ON chats FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);

CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  tile_id uuid NOT NULL REFERENCES tiles(id) ON DELETE CASCADE,
  home_id uuid REFERENCES homes(id) ON DELETE SET NULL,
  prompt text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  kept boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated images"
  ON generated_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = generated_images.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own generated images"
  ON generated_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = generated_images.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own generated images"
  ON generated_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = generated_images.chat_id
      AND chats.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = generated_images.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own generated images"
  ON generated_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = generated_images.chat_id
      AND chats.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_generated_images_chat_id ON generated_images(chat_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_tile_id ON generated_images(tile_id);
