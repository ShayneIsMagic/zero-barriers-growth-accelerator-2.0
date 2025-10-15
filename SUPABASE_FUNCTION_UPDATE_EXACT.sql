-- =====================================================
-- EXACT SUPABASE FUNCTION UPDATE SYNTAX
-- Use this exact format in Supabase SQL Editor
-- =====================================================

-- Drop the existing function first (this will also drop the triggers)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate the triggers that were dropped
-- (Supabase will show you which triggers were dropped)

-- Example trigger recreation (adjust table names as needed):
-- CREATE TRIGGER update_subscriptions_updated_at
--     BEFORE UPDATE ON subscriptions
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_system_config_updated_at
--     BEFORE UPDATE ON system_config
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_feature_flags_updated_at
--     BEFORE UPDATE ON feature_flags
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_user_preferences_updated_at
--     BEFORE UPDATE ON user_preferences
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_value_element_ref_updated_at
--     BEFORE UPDATE ON value_element_reference
--     FOR EACH ROW
--     EXECUTE FUNCTION update_updated_at_column();
