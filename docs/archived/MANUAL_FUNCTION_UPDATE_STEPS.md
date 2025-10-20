# Manual Function Update Steps

## Update update_updated_at_column() Function

The comprehensive fix handles most functions automatically, but `update_updated_at_column()` has triggers depending on it, so it needs manual updating.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to "Database" → "Functions"

2. **Find the Function**
   - Look for `update_updated_at_column`
   - Click on it to edit

3. **Update the Function Definition**
   - Add `SET search_path = public` to the function definition
   - The function should look like this:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SECURITY DEFINER
SET search_path = public;
```

4. **Save the Changes**
   - Click "Save" or "Update Function"

### Why This is Needed:
- The function has triggers depending on it
- We can't drop it with CASCADE without breaking existing functionality
- Manual update is the safest approach
- This fixes the "Function Search Path Mutable" warning

### Verification:
After updating, the Supabase Security Advisor should show:
- ✅ 0 RLS errors
- ✅ 0 Function Search Path warnings

## Alternative: If You Want to Recreate the Function

If you prefer to recreate the function completely:

1. **Note the current triggers:**
   - `update_subscriptions_updated_at`
   - `update_system_config_updated_at`
   - `update_feature_flags_updated_at`
   - `update_user_preferences_updated_at`
   - `update_value_element_ref_updated_at`

2. **Drop the function with CASCADE:**
```sql
DROP FUNCTION update_updated_at_column() CASCADE;
```

3. **Recreate the function:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql'
SECURITY DEFINER
SET search_path = public;
```

4. **Recreate the triggers** (if they were dropped):
   - This would require checking each table and recreating the triggers
   - The manual update approach above is simpler and safer
