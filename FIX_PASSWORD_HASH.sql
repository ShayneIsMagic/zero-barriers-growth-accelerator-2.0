-- =====================================================
-- FIX PASSWORD HASH FOR TEST USER
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update ONLY the test user with the correct password hash
-- Password: TestPassword123!
-- This hash was generated with: bcrypt.hash('TestPassword123!', 10)
-- NOTE: Preserving existing admin credentials

UPDATE "User"
SET password = '$2a$10$VsWMhaFBAeyihbKTklqq4.dbdgRjjdhQmjS/.CnkejRKRF7PH3qd.'
WHERE email = 'test@zerobarriers.com';

-- Do NOT update admin user - preserving existing credentials
-- UPDATE "User"
-- SET password = '$2a$10$VsWMhaFBAeyihbKTklqq4.dbdgRjjdhQmjS/.CnkejRKRF7PH3qd.'
-- WHERE email = 'admin@zerobarriers.com';

-- Verify the update (only test user)
SELECT
    id,
    email,
    name,
    role,
    "createdAt",
    CASE
        WHEN password IS NOT NULL THEN 'Password set'
        ELSE 'No password'
    END as password_status
FROM "User"
WHERE email = 'test@zerobarriers.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ TEST USER PASSWORD FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Test Credentials:';
    RAISE NOTICE '   Email: test@zerobarriers.com';
    RAISE NOTICE '   Password: TestPassword123!';
    RAISE NOTICE '';
    RAISE NOTICE '👑 Admin Credentials:';
    RAISE NOTICE '   Email: admin@zerobarriers.com';
    RAISE NOTICE '   Password: [PRESERVED - unchanged]';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to test login with test user!';
END $$;
