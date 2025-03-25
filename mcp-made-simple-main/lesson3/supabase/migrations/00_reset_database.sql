-- Reset Database Script
-- This script safely removes all database objects from the current schema.
-- Run this when you want to start with a completely clean slate.

-- Step 1: Disable RLS to allow cleanup operations
-- This is temporary and will be re-enabled when we create tables
ALTER TABLE IF EXISTS items DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing tables
-- CASCADE ensures we also remove any dependencies
DROP TABLE IF EXISTS items CASCADE;

-- Step 3: Clean up any custom types
-- This removes any enum types we've created
DO $$ 
DECLARE 
    type_name text;
BEGIN
    FOR type_name IN (SELECT t.typname
                     FROM pg_type t
                     JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                     WHERE n.nspname = current_schema()
                     AND t.typtype = 'e'  -- enum type
                     AND t.typarray = 0)  -- not an array type
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || type_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 4: Remove any custom functions
-- This includes stored procedures and triggers
DO $$ 
DECLARE 
    func_name text;
BEGIN
    FOR func_name IN (SELECT p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')'
                     FROM pg_proc p
                     JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
                     WHERE n.nspname = current_schema())
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 5: Reset all sequences
-- This ensures our auto-incrementing IDs start fresh
DO $$ 
DECLARE 
    seq_name text;
BEGIN
    FOR seq_name IN (SELECT sequence_name 
                    FROM information_schema.sequences 
                    WHERE sequence_schema = current_schema())
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || seq_name || ' CASCADE';
    END LOOP;
END $$;

-- Step 6: Clean up any remaining policies
-- Remove all Row Level Security policies
DO $$ 
DECLARE 
    pol_name text;
    tab_name text;
BEGIN
    FOR pol_name, tab_name IN (SELECT policyname, tablename
                              FROM pg_policies 
                              WHERE schemaname = current_schema())
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || pol_name || ' ON ' || tab_name;
    END LOOP;
END $$;

-- Step 7: Reset search path to default
-- This ensures we're using the standard PostgreSQL schema configuration
SET search_path TO "$user", public;

-- Step 8: Verify clean state
-- Outputs a message confirming the reset is complete
DO $$ 
BEGIN 
    RAISE NOTICE 'Database reset complete. Current schema is empty.';
END $$;
