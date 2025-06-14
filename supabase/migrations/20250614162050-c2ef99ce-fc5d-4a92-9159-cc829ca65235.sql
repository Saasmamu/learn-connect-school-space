
-- Enhanced Video Learning Features
CREATE TABLE public.video_annotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_content_id UUID REFERENCES public.video_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  timestamp_seconds INTEGER NOT NULL,
  content TEXT NOT NULL,
  annotation_type TEXT DEFAULT 'note' CHECK (annotation_type IN ('note', 'question', 'bookmark')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.video_quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  video_content_id UUID REFERENCES public.video_content(id) ON DELETE CASCADE,
  timestamp_seconds INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'text', 'boolean')),
  options JSONB,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.video_quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.video_quiz_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Assignment Types
CREATE TABLE public.assignment_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.peer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.grading_rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  criteria_name TEXT NOT NULL,
  description TEXT,
  max_points INTEGER NOT NULL,
  weight DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Communication & Collaboration
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT DEFAULT 'class' CHECK (room_type IN ('class', 'study_group', 'office_hours')),
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
  file_url TEXT,
  replied_to_id UUID REFERENCES public.chat_messages(id),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.office_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.office_hours_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  office_hours_id UUID REFERENCES public.office_hours(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  questions TEXT,
  booking_status TEXT DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'cancelled', 'completed')),
  booked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Advanced Analytics
CREATE TABLE public.learning_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('video_watch', 'assignment_start', 'assignment_submit', 'lesson_complete', 'quiz_attempt')),
  duration_seconds INTEGER,
  completion_percentage INTEGER DEFAULT 0,
  score DECIMAL(5,2),
  metadata JSONB,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('engagement', 'comprehension', 'participation', 'progress')),
  value DECIMAL(10,2) NOT NULL,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id, metric_type, calculation_date)
);

-- Enhanced Assessment Features
CREATE TABLE public.question_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  created_by UUID NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.bank_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'mcq' CHECK (question_type IN ('mcq', 'text', 'boolean', 'matching', 'drag_drop')),
  options JSONB,
  correct_answer TEXT,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  difficulty_level TEXT CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_limit_minutes INTEGER,
  auto_submitted BOOLEAN DEFAULT false,
  session_data JSONB,
  total_score DECIMAL(5,2),
  max_score DECIMAL(5,2)
);

-- RLS Policies
ALTER TABLE public.video_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grading_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.office_hours_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Video annotations policies
CREATE POLICY "Users can view video annotations" ON public.video_annotations FOR SELECT USING (true);
CREATE POLICY "Users can create their own video annotations" ON public.video_annotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own video annotations" ON public.video_annotations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own video annotations" ON public.video_annotations FOR DELETE USING (auth.uid() = user_id);

-- Video quiz policies
CREATE POLICY "Users can view video quiz questions" ON public.video_quiz_questions FOR SELECT USING (true);
CREATE POLICY "Teachers can manage video quiz questions" ON public.video_quiz_questions FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can view their quiz responses" ON public.video_quiz_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create quiz responses" ON public.video_quiz_responses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Assignment files policies
CREATE POLICY "Users can view assignment files" ON public.assignment_files FOR SELECT USING (true);
CREATE POLICY "Users can upload assignment files" ON public.assignment_files FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Chat policies
CREATE POLICY "Class members can view chat rooms" ON public.chat_rooms FOR SELECT USING (true);
CREATE POLICY "Class members can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can send chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Office hours policies
CREATE POLICY "Users can view office hours" ON public.office_hours FOR SELECT USING (true);
CREATE POLICY "Teachers can manage office hours" ON public.office_hours FOR ALL USING (auth.uid() = teacher_id);
CREATE POLICY "Students can book office hours" ON public.office_hours_bookings FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can view their bookings" ON public.office_hours_bookings FOR SELECT USING (auth.uid() = student_id);

-- Analytics policies
CREATE POLICY "Users can view their analytics" ON public.learning_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert analytics" ON public.learning_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their metrics" ON public.performance_metrics FOR SELECT USING (auth.uid() = user_id);

-- Question banks policies
CREATE POLICY "Users can view public question banks" ON public.question_banks FOR SELECT USING (is_public = true OR auth.uid() = created_by);
CREATE POLICY "Users can create question banks" ON public.question_banks FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view bank questions" ON public.bank_questions FOR SELECT USING (true);

-- Quiz sessions policies
CREATE POLICY "Students can view their quiz sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can create quiz sessions" ON public.quiz_sessions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update their quiz sessions" ON public.quiz_sessions FOR UPDATE USING (auth.uid() = student_id);

-- Storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignment-files', 'assignment-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assignment files
CREATE POLICY "Users can upload assignment files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'assignment-files');

CREATE POLICY "Users can view assignment files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'assignment-files');

-- Functions for analytics (Fixed parameter order)
CREATE OR REPLACE FUNCTION public.record_learning_activity(
  p_class_id UUID,
  p_lesson_id UUID DEFAULT NULL,
  p_activity_type TEXT DEFAULT NULL,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_completion_percentage INTEGER DEFAULT 0,
  p_score DECIMAL DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.learning_analytics (
    user_id,
    class_id,
    lesson_id,
    activity_type,
    duration_seconds,
    completion_percentage,
    score,
    metadata
  ) VALUES (
    auth.uid(),
    p_class_id,
    p_lesson_id,
    p_activity_type,
    p_duration_seconds,
    p_completion_percentage,
    p_score,
    p_metadata
  );
END;
$$;

-- Function to calculate performance metrics
CREATE OR REPLACE FUNCTION public.calculate_performance_metrics(p_user_id UUID, p_class_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  engagement_score DECIMAL;
  comprehension_score DECIMAL;
  participation_score DECIMAL;
  progress_score DECIMAL;
BEGIN
  -- Calculate engagement (based on time spent)
  SELECT COALESCE(AVG(duration_seconds::DECIMAL / 3600), 0) INTO engagement_score
  FROM public.learning_analytics
  WHERE user_id = p_user_id AND class_id = p_class_id
  AND recorded_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate comprehension (based on quiz/assignment scores)
  SELECT COALESCE(AVG(score), 0) INTO comprehension_score
  FROM public.learning_analytics
  WHERE user_id = p_user_id AND class_id = p_class_id
  AND score IS NOT NULL
  AND recorded_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate participation (based on forum posts, chat messages)
  SELECT COALESCE(COUNT(*), 0) INTO participation_score
  FROM public.chat_messages cm
  JOIN public.chat_rooms cr ON cm.room_id = cr.id
  WHERE cm.sender_id = p_user_id AND cr.class_id = p_class_id
  AND cm.sent_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Calculate progress (based on lesson completion)
  SELECT COALESCE(AVG(completion_percentage), 0) INTO progress_score
  FROM public.student_progress
  WHERE student_id = p_user_id AND class_id = p_class_id;

  -- Insert/update metrics
  INSERT INTO public.performance_metrics (user_id, class_id, metric_type, value)
  VALUES 
    (p_user_id, p_class_id, 'engagement', engagement_score),
    (p_user_id, p_class_id, 'comprehension', comprehension_score),
    (p_user_id, p_class_id, 'participation', participation_score),
    (p_user_id, p_class_id, 'progress', progress_score)
  ON CONFLICT (user_id, class_id, metric_type, calculation_date)
  DO UPDATE SET 
    value = EXCLUDED.value,
    created_at = now();
END;
$$;
