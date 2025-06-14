
-- Create courses table for storing course information
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES public.profiles(id) NOT NULL,
  category TEXT,
  level TEXT,
  duration TEXT,
  price DECIMAL(10,2),
  is_published BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_lessons table to link lessons to courses
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  lesson_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, lesson_id)
);

-- Create course_enrollments table for student enrollments
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(course_id, student_id)
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published public courses" 
  ON public.courses 
  FOR SELECT 
  USING (is_published = true AND is_public = true);

CREATE POLICY "Instructors can view their own courses" 
  ON public.courses 
  FOR SELECT 
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their own courses" 
  ON public.courses 
  FOR UPDATE 
  USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete their own courses" 
  ON public.courses 
  FOR DELETE 
  USING (instructor_id = auth.uid());

-- RLS Policies for course_lessons
CREATE POLICY "Anyone can view lessons of public courses" 
  ON public.course_lessons 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND c.is_published = true AND c.is_public = true
  ));

CREATE POLICY "Instructors can manage their course lessons" 
  ON public.course_lessons 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  ));

-- RLS Policies for course_enrollments
CREATE POLICY "Students can view their own enrollments" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (student_id = auth.uid());

CREATE POLICY "Students can enroll in courses" 
  ON public.course_enrollments 
  FOR INSERT 
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view enrollments for their courses" 
  ON public.course_enrollments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.courses c 
    WHERE c.id = course_id AND c.instructor_id = auth.uid()
  ));
