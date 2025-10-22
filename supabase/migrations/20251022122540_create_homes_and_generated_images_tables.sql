/*
  # Create Homes and Generated Images Tables

  ## Summary
  This migration creates two new tables for managing home images and generated visualizations.

  ## 1. New Tables
  
  ### `homes`
  - `id` (uuid, primary key) - Unique identifier for each home
  - `user_id` (uuid, foreign key) - References auth.users
  - `name` (text) - Optional name for the home
  - `image_url` (text) - URL to the home image in storage
  - `created_at` (timestamptz) - When the home was uploaded
  - `updated_at` (timestamptz) - Last update timestamp

  ### `generated_images`
  - `id` (uuid, primary key) - Unique identifier for each generated image
  - `user_id` (uuid, foreign key) - References auth.users
  - `tile_id` (uuid, foreign key) - References tiles table
  - `home_id` (uuid, foreign key, nullable) - References homes table (optional)
  - `prompt` (text) - The prompt used for generation
  - `image_url` (text) - URL to the generated image
  - `home_image_url` (text, nullable) - Original home image URL for comparison
  - `saved` (boolean) - Whether the image is saved/favorited
  - `created_at` (timestamptz) - When the image was generated
  
  ## 2. Security
  - Enable RLS on both tables
  - Users can only access their own homes and generated images
  - Separate policies for SELECT, INSERT, UPDATE, and DELETE operations
  
  ## 3. Indexes
  - Index on user_id for both tables for faster queries
  - Index on tile_id for generated_images for quick tile-specific lookups
*/

CREATE TABLE IF NOT EXISTS homes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT ''::text,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tile_id uuid NOT NULL REFERENCES tiles(id) ON DELETE CASCADE,
  home_id uuid REFERENCES homes(id) ON DELETE SET NULL,
  prompt text DEFAULT ''::text,
  image_url text NOT NULL,
  home_image_url text,
  saved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS homes_user_id_idx ON homes(user_id);
CREATE INDEX IF NOT EXISTS homes_created_at_idx ON homes(created_at DESC);
CREATE INDEX IF NOT EXISTS generated_images_user_id_idx ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS generated_images_tile_id_idx ON generated_images(tile_id);
CREATE INDEX IF NOT EXISTS generated_images_created_at_idx ON generated_images(created_at DESC);

ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own homes"
  ON homes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own homes"
  ON homes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own homes"
  ON homes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own homes"
  ON homes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own generated images"
  ON generated_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated images"
  ON generated_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generated images"
  ON generated_images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated images"
  ON generated_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);