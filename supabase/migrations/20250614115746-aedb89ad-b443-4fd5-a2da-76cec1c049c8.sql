
-- Create video_content table for managing video assets
CREATE TABLE public.video_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  video_quality VARCHAR(20) DEFAULT 'HD',
  upload_status VARCHAR(20) DEFAULT 'pending' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_processing_jobs table for tracking video processing
CREATE TABLE public.video_processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_content_id UUID REFERENCES public.video_content(id) ON DELETE CASCADE,
  processing_status VARCHAR(20) DEFAULT 'queued' CHECK (processing_status IN ('queued', 'processing', 'completed', 'failed')),
  progress_percentage INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_playlists table for organizing videos
CREATE TABLE public.video_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video_playlist_items for playlist content
CREATE TABLE public.video_playlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES public.video_playlists(id) ON DELETE CASCADE,
  video_content_id UUID REFERENCES public.video_content(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, video_content_id)
);

-- Create video_watch_history for tracking student progress
CREATE TABLE public.video_watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  video_content_id UUID REFERENCES public.video_content(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  watch_time_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_content_id, lesson_id)
);

-- Add video content reference to lessons table
ALTER TABLE public.lessons 
ADD COLUMN video_content_id UUID REFERENCES public.video_content(id);

-- Create storage bucket for video uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('video-thumbnails', 'video-thumbnails', true);

-- Enable RLS on new tables
ALTER TABLE public.video_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for video_content
CREATE POLICY "Teachers and admins can manage video content" ON public.video_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Students can view published video content" ON public.video_content
  FOR SELECT USING (upload_status = 'completed');

-- RLS policies for video_processing_jobs
CREATE POLICY "Users can view their own processing jobs" ON public.video_processing_jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.video_content vc 
      WHERE vc.id = video_content_id 
      AND vc.uploaded_by = auth.uid()
    )
  );

-- RLS policies for video_playlists
CREATE POLICY "Users can manage their own playlists" ON public.video_playlists
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can view public playlists" ON public.video_playlists
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

-- RLS policies for video_playlist_items
CREATE POLICY "Users can manage items in their playlists" ON public.video_playlist_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.video_playlists vp 
      WHERE vp.id = playlist_id 
      AND vp.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view items in accessible playlists" ON public.video_playlist_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.video_playlists vp 
      WHERE vp.id = playlist_id 
      AND (vp.is_public = true OR vp.created_by = auth.uid())
    )
  );

-- RLS policies for video_watch_history
CREATE POLICY "Users can manage their own watch history" ON public.video_watch_history
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_video_content_uploaded_by ON public.video_content(uploaded_by);
CREATE INDEX idx_video_content_status ON public.video_content(upload_status);
CREATE INDEX idx_video_processing_jobs_video_id ON public.video_processing_jobs(video_content_id);
CREATE INDEX idx_video_playlist_items_playlist ON public.video_playlist_items(playlist_id);
CREATE INDEX idx_video_playlist_items_video ON public.video_playlist_items(video_content_id);
CREATE INDEX idx_video_watch_history_user ON public.video_watch_history(user_id);
CREATE INDEX idx_video_watch_history_video ON public.video_watch_history(video_content_id);
CREATE INDEX idx_lessons_video_content ON public.lessons(video_content_id);

-- Create function to update video watch progress
CREATE OR REPLACE FUNCTION public.update_video_watch_progress(
  p_video_content_id UUID,
  p_lesson_id UUID,
  p_watch_time_seconds INTEGER,
  p_completed BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.video_watch_history (
    user_id,
    video_content_id,
    lesson_id,
    watch_time_seconds,
    completed,
    last_watched_at
  ) VALUES (
    auth.uid(),
    p_video_content_id,
    p_lesson_id,
    p_watch_time_seconds,
    p_completed,
    NOW()
  )
  ON CONFLICT (user_id, video_content_id, lesson_id)
  DO UPDATE SET
    watch_time_seconds = GREATEST(video_watch_history.watch_time_seconds, p_watch_time_seconds),
    completed = video_watch_history.completed OR p_completed,
    last_watched_at = NOW();
END;
$$;
