/*
  # Add add_catalog field to tiles table

  1. Changes
    - Add `add_catalog` column (boolean) to tiles table
    - Defaults to true for existing tiles
    - When false, tile is temporary and not shown in main catalog

  2. Notes
    - Allows creating temporary tiles during chat that can later be added to catalog
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tiles' AND column_name = 'add_catalog'
  ) THEN
    ALTER TABLE tiles ADD COLUMN add_catalog boolean DEFAULT true;
  END IF;
END $$;
