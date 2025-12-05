-- Migration script to add author column to feedback table if it doesn't exist
-- This script is safe to run multiple times (idempotent)

-- Check if author column exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'feedback' 
        AND column_name = 'author'
    ) THEN
        ALTER TABLE feedback ADD COLUMN author VARCHAR(255) NOT NULL DEFAULT 'Anonymous';
        RAISE NOTICE 'Added author column to feedback table';
    ELSE
        RAISE NOTICE 'Author column already exists in feedback table';
    END IF;
END $$;

-- Update any existing feedback records that might have NULL author
UPDATE feedback SET author = 'Anonymous' WHERE author IS NULL;

-- Make sure author column is NOT NULL (in case it was nullable before)
ALTER TABLE feedback ALTER COLUMN author SET NOT NULL;
