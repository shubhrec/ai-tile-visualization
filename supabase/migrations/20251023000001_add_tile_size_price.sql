/*
  # Add size and price fields to tiles table

  1. Changes
    - Add `size` column (text) to tiles table - Store tile dimensions (e.g., "600x600 mm")
    - Add `price` column (numeric) to tiles table - Store tile price with decimal precision

  2. Notes
    - Both fields are optional (nullable) to maintain backwards compatibility
    - Price uses numeric(10,2) for storing currency values with 2 decimal places
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tiles' AND column_name = 'size'
  ) THEN
    ALTER TABLE tiles ADD COLUMN size text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tiles' AND column_name = 'price'
  ) THEN
    ALTER TABLE tiles ADD COLUMN price numeric(10,2);
  END IF;
END $$;
