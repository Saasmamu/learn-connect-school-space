
-- Enhance the profiles table with additional fields for teacher showcase
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specializations text[],
ADD COLUMN IF NOT EXISTS social_media_links jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS years_experience integer,
ADD COLUMN IF NOT EXISTS education_background text,
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for profiles (enhance existing ones)
DROP POLICY IF EXISTS "Users can view featured teacher profiles" ON public.profiles;
CREATE POLICY "Users can view featured teacher profiles" 
  ON public.profiles 
  FOR SELECT 
  TO anon, authenticated
  USING (role = 'teacher' AND is_featured = true);

-- Storage policies for profile pictures
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
CREATE POLICY "Users can upload their own profile pictures"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view all profile pictures" ON storage.objects;
CREATE POLICY "Users can view all profile pictures"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'profile-pictures');

DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
CREATE POLICY "Users can update their own profile pictures"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
CREATE POLICY "Users can delete their own profile pictures"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
