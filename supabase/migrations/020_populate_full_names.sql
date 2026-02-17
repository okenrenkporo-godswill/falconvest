-- Populate full_name for existing users who don't have it set
UPDATE public.profiles
SET full_name = CASE 
  WHEN first_name != '' AND last_name != '' THEN first_name || ' ' || last_name
  WHEN first_name != '' THEN first_name
  WHEN last_name != '' THEN last_name
  ELSE split_part(email, '@', 1)
END
WHERE full_name IS NULL OR full_name = '';
