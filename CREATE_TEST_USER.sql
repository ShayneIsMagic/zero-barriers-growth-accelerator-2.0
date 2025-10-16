-- Create test user for authentication
-- This user should be able to log in with the provided credentials

-- First, check the User table schema
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'User'
ORDER BY ordinal_position;

-- Check if user already exists
SELECT id, email, name, role FROM "User" WHERE email = 'shayne+1@devpipeline.com';

-- Create user with only the columns that exist
-- Note: Password is 'ZBadmin123!' hashed with bcrypt
INSERT INTO "User" (id, email, name, role, password)
VALUES (
  'test-user-shayne',
  'shayne+1@devpipeline.com',
  'Shayne Roy',
  'SUPER_ADMIN',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K2' -- This is 'ZBadmin123!' hashed
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password;

-- Verify the user was created/updated
SELECT id, email, name, role FROM "User" WHERE email = 'shayne+1@devpipeline.com';
