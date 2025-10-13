-- =====================================================
-- CREATE TEST USER FOR LOGIN TESTING
-- Run this in Supabase SQL Editor
-- =====================================================

-- Create a test user with hashed password
-- Password: TestPassword123! (you can change this)
-- Email: test@zerobarriers.com

INSERT INTO "User" (
    id,
    email,
    name,
    password,
    role,
    "createdAt",
    "updatedAt"
)
VALUES (
    (gen_random_uuid())::text,
    'test@zerobarriers.com',
    'Test User',
    -- This is bcrypt hash of 'TestPassword123!' with salt rounds = 10
    -- You should generate your own hash using bcrypt
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'USER',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Create admin user for testing
INSERT INTO "User" (
    id,
    email,
    name,
    password,
    role,
    "createdAt",
    "updatedAt"
)
VALUES (
    (gen_random_uuid())::text,
    'admin@zerobarriers.com',
    'Admin User',
    -- Same password: TestPassword123!
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'ADMIN',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT
    id,
    email,
    name,
    role,
    "createdAt"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 5;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ TEST USERS CREATED!';
    RAISE NOTICE '';
    RAISE NOTICE '📧 Test User Credentials:';
    RAISE NOTICE '   Email: test@zerobarriers.com';
    RAISE NOTICE '   Password: TestPassword123!';
    RAISE NOTICE '';
    RAISE NOTICE '👑 Admin User Credentials:';
    RAISE NOTICE '   Email: admin@zerobarriers.com';
    RAISE NOTICE '   Password: TestPassword123!';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Test login at:';
    RAISE NOTICE '   https://zero-barriers-growth-accelerator-20.vercel.app/auth/signin';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NOTE: Make sure Vercel environment variables are set!';
END $$;

