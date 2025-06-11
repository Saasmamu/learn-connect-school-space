
-- Phase 1: Enhanced Database Structure for Complete LMS

-- Create lessons table
CREATE TABLE public.lessons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  video_url text,
  lesson_order integer DEFAULT 0,
  duration_minutes integer,
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create assignments table
CREATE TABLE public.assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  due_date timestamp with time zone,
  max_points integer DEFAULT 100,
  assignment_type text DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'quiz', 'project', 'exam')),
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table
CREATE TABLE public.submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text,
  file_url text,
  submitted_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_late boolean DEFAULT false,
  UNIQUE(assignment_id, student_id)
);

-- Create grades table
CREATE TABLE public.grades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_earned numeric(5,2),
  max_points numeric(5,2),
  feedback text,
  graded_by uuid REFERENCES public.profiles(id),
  graded_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(assignment_id, student_id)
);

-- Create attendance table
CREATE TABLE public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE SET NULL,
  attendance_date date NOT NULL,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  marked_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(class_id, student_id, attendance_date)
);

-- Create discussion forums table
CREATE TABLE public.forums (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create forum posts table
CREATE TABLE public.forum_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  forum_id uuid REFERENCES public.forums(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  author_id uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general' CHECK (type IN ('general', 'assignment', 'grade', 'announcement', 'reminder')),
  is_read boolean DEFAULT false,
  related_id uuid, -- Can reference any table (assignment, lesson, etc.)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create announcements table
CREATE TABLE public.announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  is_urgent boolean DEFAULT false,
  is_published boolean DEFAULT false,
  publish_date timestamp with time zone,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create progress tracking table
CREATE TABLE public.student_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE,
  completion_percentage integer DEFAULT 0,
  time_spent_minutes integer DEFAULT 0,
  last_accessed timestamp with time zone,
  is_completed boolean DEFAULT false,
  UNIQUE(student_id, lesson_id)
);

-- Create Quran progress table (Islamic feature)
CREATE TABLE public.quran_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  surah_number integer NOT NULL,
  ayah_number integer NOT NULL,
  memorization_status text DEFAULT 'learning' CHECK (memorization_status IN ('learning', 'memorized', 'reviewing')),
  recitation_quality integer CHECK (recitation_quality >= 1 AND recitation_quality <= 5),
  last_reviewed timestamp with time zone,
  teacher_notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, surah_number, ayah_number)
);

-- Create Islamic calendar events table
CREATE TABLE public.islamic_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_type text DEFAULT 'general' CHECK (event_type IN ('general', 'prayer', 'holiday', 'fast')),
  is_recurring boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for all new tables

-- Lessons policies
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage lessons for their classes" 
  ON public.lessons 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc 
      WHERE tc.class_id = lessons.class_id 
      AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view published lessons for their classes" 
  ON public.lessons 
  FOR SELECT 
  USING (
    is_published = true AND 
    EXISTS (
      SELECT 1 FROM public.student_classes sc 
      WHERE sc.class_id = lessons.class_id 
      AND sc.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all lessons" 
  ON public.lessons 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Assignments policies
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage assignments for their classes" 
  ON public.assignments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc 
      WHERE tc.class_id = assignments.class_id 
      AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view published assignments for their classes" 
  ON public.assignments 
  FOR SELECT 
  USING (
    is_published = true AND 
    EXISTS (
      SELECT 1 FROM public.student_classes sc 
      WHERE sc.class_id = assignments.class_id 
      AND sc.student_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments" 
  ON public.assignments 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Submissions policies
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage their own submissions" 
  ON public.submissions 
  FOR ALL 
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can view submissions for their classes" 
  ON public.submissions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.teacher_classes tc ON tc.class_id = a.class_id
      WHERE a.id = submissions.assignment_id 
      AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all submissions" 
  ON public.submissions 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Grades policies
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own grades" 
  ON public.grades 
  FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage grades for their classes" 
  ON public.grades 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.teacher_classes tc ON tc.class_id = a.class_id
      WHERE a.id = grades.assignment_id 
      AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all grades" 
  ON public.grades 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Attendance policies
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own attendance" 
  ON public.attendance 
  FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Teachers can manage attendance for their classes" 
  ON public.attendance 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc 
      WHERE tc.class_id = attendance.class_id 
      AND tc.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all attendance" 
  ON public.attendance 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Add similar policies for other tables...
-- (Continuing with notifications, forums, progress, etc.)

-- Create indexes for better performance
CREATE INDEX idx_lessons_class_id ON public.lessons(class_id);
CREATE INDEX idx_assignments_class_id ON public.assignments(class_id);
CREATE INDEX idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_grades_student_id ON public.grades(student_id);
CREATE INDEX idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
CREATE INDEX idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX idx_quran_progress_student_id ON public.quran_progress(student_id);
