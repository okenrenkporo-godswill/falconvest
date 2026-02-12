-- Add full_name column if missing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fix handle_new_user trigger with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  f_name TEXT;
  l_name TEXT;
BEGIN
  -- Extract names
  f_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  l_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  
  -- Generate base username
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  final_username := base_username;
  
  -- Handle username conflicts by appending numbers
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    first_name, 
    last_name,
    full_name,
    phone, 
    country, 
    state, 
    city, 
    address
  )
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    f_name,
    l_name,
    CASE 
      WHEN f_name != '' AND l_name != '' THEN f_name || ' ' || l_name
      WHEN f_name != '' THEN f_name
      ELSE split_part(NEW.email, '@', 1)
    END,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', '')
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
