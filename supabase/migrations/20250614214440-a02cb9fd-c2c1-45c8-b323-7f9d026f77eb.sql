
-- Add foreign key constraints to link tables with profiles
ALTER TABLE public.assignment_files 
ADD CONSTRAINT assignment_files_uploaded_by_profiles_id_fkey 
FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

ALTER TABLE public.chat_messages 
ADD CONSTRAINT chat_messages_sender_id_profiles_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id);

ALTER TABLE public.video_annotations 
ADD CONSTRAINT video_annotations_user_id_profiles_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id);
