
-- First, let's add Row Level Security policies for the existing tables
-- Enable RLS on tables that don't have it yet (if not already enabled)
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Students can view their own class enrollments" ON public.student_classes;
DROP POLICY IF EXISTS "Admins can manage all student class enrollments" ON public.student_classes;
DROP POLICY IF EXISTS "Teachers can view their own class assignments" ON public.teacher_classes;
DROP POLICY IF EXISTS "Admins can manage all teacher class assignments" ON public.teacher_classes;
DROP POLICY IF EXISTS "Students can view and update their own progress" ON public.student_progress;
DROP POLICY IF EXISTS "Teachers can view progress for their class students" ON public.student_progress;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins and teachers can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- RLS policies for student_classes
CREATE POLICY "Students can view their own class enrollments" 
  ON public.student_classes 
  FOR SELECT 
  USING (auth.uid() = student_id);

CREATE POLICY "Admins can manage all student class enrollments" 
  ON public.student_classes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS policies for teacher_classes
CREATE POLICY "Teachers can view their own class assignments" 
  ON public.teacher_classes 
  FOR SELECT 
  USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage all teacher class assignments" 
  ON public.teacher_classes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS policies for student_progress
CREATE POLICY "Students can view and update their own progress" 
  ON public.student_progress 
  FOR ALL 
  USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view progress for their class students" 
  ON public.student_progress 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_classes tc
      JOIN public.student_classes sc ON tc.class_id = sc.class_id
      WHERE tc.teacher_id = auth.uid() AND sc.student_id = student_progress.student_id
    ) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = recipient_id);

CREATE POLICY "Admins and teachers can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = recipient_id);

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON public.student_classes(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_class_id ON public.lessons(class_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);

-- Function to create notifications for class assignments
CREATE OR REPLACE FUNCTION public.notify_class_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify student when assigned to a class
  IF TG_TABLE_NAME = 'student_classes' THEN
    INSERT INTO public.notifications (recipient_id, title, message, type, related_id)
    SELECT 
      NEW.student_id,
      'New Class Assignment',
      'You have been enrolled in ' || c.name,
      'assignment',
      NEW.class_id
    FROM public.classes c
    WHERE c.id = NEW.class_id;
  END IF;
  
  -- Notify teacher when assigned to a class
  IF TG_TABLE_NAME = 'teacher_classes' THEN
    INSERT INTO public.notifications (recipient_id, title, message, type, related_id)
    SELECT 
      NEW.teacher_id,
      'New Class Assignment',
      'You have been assigned to teach ' || c.name,
      'assignment',
      NEW.class_id
    FROM public.classes c
    WHERE c.id = NEW.class_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for notifications (drop first if they exist)
DROP TRIGGER IF EXISTS trigger_notify_student_class_assignment ON public.student_classes;
DROP TRIGGER IF EXISTS trigger_notify_teacher_class_assignment ON public.teacher_classes;

CREATE TRIGGER trigger_notify_student_class_assignment
  AFTER INSERT ON public.student_classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_class_assignment();

CREATE TRIGGER trigger_notify_teacher_class_assignment
  AFTER INSERT ON public.teacher_classes
  FOR EACH ROW EXECUTE FUNCTION public.notify_class_assignment();
