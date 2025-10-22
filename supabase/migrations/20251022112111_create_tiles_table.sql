/*
  # Create tiles table

  1. New Tables
    - `tiles`
      - `id` (uuid, primary key) - Unique identifier for each tile
      - `user_id` (uuid, foreign key) - References auth.users to tie tiles to specific users
      - `name` (text) - Name/description of the tile
      - `image_url` (text) - URL to the tile image in Supabase storage
      - `created_at` (timestamptz) - Timestamp of when the tile was created
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `tiles` table
    - Add policy for authenticated users to read their own tiles
    - Add policy for authenticated users to insert their own tiles
    - Add policy for authenticated users to update their own tiles
    - Add policy for authenticated users to delete their own tiles

  3. Indexes
    - Index on user_id for faster queries filtering by user
*/

CREATE TABLE IF NOT EXISTS tiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tiles"
  ON tiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tiles"
  ON tiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tiles"
  ON tiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tiles"
  ON tiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tiles_user_id ON tiles(user_id);