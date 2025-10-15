-- =====================================================
-- FIX PASSWORD HASH FOR TEST USER
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update your admin user with the correct password hash
-- Password: ZBadmin123!
-- This hash was generated with: bcrypt.hash('ZBadmin123!', 10)

UPDATE "User"
SET password = '$2a$10$G2w9G2c9K8fROlh/GCnOEe7jsyRgjlZV8TvM9HiCuHYvT02czCMZC'
WHERE email = 'shayne+1@devpipeline.com';

-- Verify the update (your admin user)
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
WHERE email = 'shayne+1@devpipeline.com';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ ADMIN PASSWORD FIXED!';
    RAISE NOTICE '';
    RAISE NOTICE '👑 Your Admin Credentials:';
    RAISE NOTICE '   Email: shayne+1@devpipeline.com';
    RAISE NOTICE '   Password: ZBadmin123!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to login to your site!';
END $$;
