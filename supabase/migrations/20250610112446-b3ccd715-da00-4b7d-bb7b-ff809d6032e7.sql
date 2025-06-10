
-- Fix the infinite recursion in RLS policies by removing problematic policies
-- and recreating them with simpler, non-recursive logic

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and teachers can manage classes" ON public.classes;
DROP POLICY IF EXISTS "Admins and teachers can view all enrollments" ON public.student_classes;
DROP POLICY IF EXISTS "Admins can manage enrollments" ON public.student_classes;
DROP POLICY IF EXISTS "Admins can view all teacher assignments" ON public.teacher_classes;
DROP POLICY IF EXISTS "Admins can manage teacher assignments" ON public.teacher_classes;

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Recreate policies with simpler logic that won't cause recursion
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Recreate class policies
CREATE POLICY "Admins and teachers can manage classes" 
  ON public.classes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

-- Recreate student_classes policies
CREATE POLICY "Admins and teachers can view all enrollments" 
  ON public.student_classes 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) IN ('admin', 'teacher'));

CREATE POLICY "Admins can manage enrollments" 
  ON public.student_classes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Recreate teacher_classes policies
CREATE POLICY "Admins can view all teacher assignments" 
  ON public.teacher_classes 
  FOR SELECT 
  USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage teacher assignments" 
  ON public.teacher_classes 
  FOR ALL 
  USING (public.get_user_role(auth.uid()) = 'admin');
