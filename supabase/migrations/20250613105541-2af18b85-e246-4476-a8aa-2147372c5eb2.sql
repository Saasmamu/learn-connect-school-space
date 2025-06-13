
-- Add question types and quiz/exam support to assignments
ALTER TABLE public.assignments 
ADD COLUMN IF NOT EXISTS time_limit_minutes INTEGER,
ADD COLUMN IF NOT EXISTS scheduled_release TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS grading_mode TEXT DEFAULT 'manual' CHECK (grading_mode IN ('manual', 'auto')),
ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS reference_materials JSONB;

-- Create assignment questions table
CREATE TABLE IF NOT EXISTS public.assignment_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short_answer', 'essay', 'file_upload')),
  question_order INTEGER DEFAULT 0,
  points NUMERIC DEFAULT 1,
  options JSONB, -- For MCQ options
  correct_answer TEXT, -- For auto-grading
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create assignment answers table
CREATE TABLE IF NOT EXISTS public.assignment_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.assignment_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  file_url TEXT,
  is_correct BOOLEAN,
  points_earned NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add submission status and attempt tracking
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'late')),
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Update grades table to link with answers
ALTER TABLE public.grades 
ADD COLUMN IF NOT EXISTS auto_graded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS percentage NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN max_points > 0 THEN (points_earned / max_points * 100)
    ELSE 0
  END
) STORED;

-- Enable RLS on new tables
ALTER TABLE public.assignment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_answers ENABLE ROW LEVEL SECURITY;

-- RLS policies for assignment_questions
CREATE POLICY "Teachers and admins can manage assignment questions" 
  ON public.assignment_questions 
  FOR ALL 
  USING (
    public.get_user_role(auth.uid()) IN ('admin', 'teacher') OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      WHERE a.id = assignment_questions.assignment_id 
      AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Students can view published assignment questions" 
  ON public.assignment_questions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.student_classes sc ON a.class_id = sc.class_id
      WHERE a.id = assignment_questions.assignment_id 
      AND a.is_published = true
      AND sc.student_id = auth.uid()
    )
  );

-- RLS policies for assignment_answers
CREATE POLICY "Students can manage their own answers" 
  ON public.assignment_answers 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      WHERE s.id = assignment_answers.submission_id 
      AND s.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view answers for their assignments" 
  ON public.assignment_answers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.assignments a ON s.assignment_id = a.id
      WHERE s.id = assignment_answers.submission_id 
      AND a.created_by = auth.uid()
    ) OR
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignment_questions_assignment_id ON public.assignment_questions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_answers_submission_id ON public.assignment_answers(submission_id);
CREATE INDEX IF NOT EXISTS idx_assignment_answers_question_id ON public.assignment_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);

-- Function to auto-grade MCQ questions
CREATE OR REPLACE FUNCTION public.auto_grade_mcq_answers()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-grade MCQ questions
  IF EXISTS (
    SELECT 1 FROM public.assignment_questions aq
    WHERE aq.id = NEW.question_id 
    AND aq.question_type = 'mcq'
    AND aq.correct_answer IS NOT NULL
  ) THEN
    -- Check if answer is correct
    SELECT 
      CASE 
        WHEN aq.correct_answer = NEW.answer_text THEN true
        ELSE false
      END,
      CASE 
        WHEN aq.correct_answer = NEW.answer_text THEN aq.points
        ELSE 0
      END
    INTO NEW.is_correct, NEW.points_earned
    FROM public.assignment_questions aq
    WHERE aq.id = NEW.question_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-grading
DROP TRIGGER IF EXISTS trigger_auto_grade_mcq ON public.assignment_answers;
CREATE TRIGGER trigger_auto_grade_mcq
  BEFORE INSERT OR UPDATE ON public.assignment_answers
  FOR EACH ROW EXECUTE FUNCTION public.auto_grade_mcq_answers();

-- Function to calculate total grade for submission
CREATE OR REPLACE FUNCTION public.calculate_submission_grade(submission_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_points NUMERIC := 0;
  max_points NUMERIC := 0;
  assignment_uuid UUID;
BEGIN
  -- Get assignment ID
  SELECT assignment_id INTO assignment_uuid
  FROM public.submissions 
  WHERE id = submission_uuid;
  
  -- Calculate total points earned
  SELECT COALESCE(SUM(aa.points_earned), 0) INTO total_points
  FROM public.assignment_answers aa
  WHERE aa.submission_id = submission_uuid;
  
  -- Get max possible points
  SELECT COALESCE(SUM(aq.points), 0) INTO max_points
  FROM public.assignment_questions aq
  WHERE aq.assignment_id = assignment_uuid;
  
  -- Insert or update grade
  INSERT INTO public.grades (student_id, assignment_id, submission_id, points_earned, max_points, auto_graded)
  SELECT s.student_id, s.assignment_id, submission_uuid, total_points, max_points, true
  FROM public.submissions s
  WHERE s.id = submission_uuid
  ON CONFLICT (student_id, assignment_id) 
  DO UPDATE SET 
    points_earned = total_points,
    max_points = EXCLUDED.max_points,
    auto_graded = true,
    graded_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
