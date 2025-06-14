import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, Eye, CheckCircle } from 'lucide-react';
import { CourseBasicInfo } from '@/components/course-creation/CourseBasicInfo';
import { CourseLessons } from '@/components/course-creation/CourseLessons';
import { CourseSettings } from '@/components/course-creation/CourseSettings';
import { CoursePreview } from '@/components/course-creation/CoursePreview';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CourseData {
  name: string;
  description: string;
  grade_level: string;
  lessons: Array<{
    id?: string;
    title: string;
    description: string;
    content: string;
    video_url?: string;
    duration_minutes?: number;
    lesson_order: number;
  }>;
  settings: {
    is_published: boolean;
    enrollment_limit?: number;
    start_date?: string;
    end_date?: string;
  };
}

const steps = [
  { id: 1, title: 'Basic Information', description: 'Course name, description, and grade level' },
  { id: 2, title: 'Lessons', description: 'Add and organize course lessons' },
  { id: 3, title: 'Settings', description: 'Publishing and enrollment settings' },
  { id: 4, title: 'Preview & Publish', description: 'Review and publish your course' },
];

export const CourseCreationPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [savedCourseId, setSavedCourseId] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<CourseData>({
    name: '',
    description: '',
    grade_level: '',
    lessons: [],
    settings: {
      is_published: false,
    },
  });

  const updateCourseData = (updates: Partial<CourseData>) => {
    setCourseData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (savedCourseId) {
        // Update existing draft
        const { error } = await supabase
          .from('courses')
          .update({
            title: courseData.name,
            description: courseData.description,
            level: courseData.grade_level,
            is_published: false,
            is_public: false,
          })
          .eq('id', savedCourseId);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('courses')
          .insert({
            title: courseData.name,
            description: courseData.description,
            level: courseData.grade_level,
            instructor_id: user?.id,
            is_published: false,
            is_public: false,
          })
          .select()
          .single();

        if (error) throw error;
        setSavedCourseId(data.id);
      }

      toast({
        title: "Draft Saved",
        description: "Your course draft has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save course draft.",
        variant: "destructive",
      });
    }
  };

  const handlePublishCourse = async () => {
    try {
      let courseId = savedCourseId;

      if (!courseId) {
        // Create new course if not saved as draft
        const { data, error } = await supabase
          .from('courses')
          .insert({
            title: courseData.name,
            description: courseData.description,
            level: courseData.grade_level,
            instructor_id: user?.id,
            is_published: true,
            is_public: true,
          })
          .select()
          .single();

        if (error) throw error;
        courseId = data.id;
      } else {
        // Update existing draft to published
        const { error } = await supabase
          .from('courses')
          .update({
            title: courseData.name,
            description: courseData.description,
            level: courseData.grade_level,
            is_published: true,
            is_public: true,
          })
          .eq('id', courseId);

        if (error) throw error;
      }

      // Save lessons if any
      if (courseData.lessons.length > 0) {
        // First create lessons in the lessons table
        const lessonsToInsert = courseData.lessons.map(lesson => ({
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          video_url: lesson.video_url,
          duration_minutes: lesson.duration_minutes,
          lesson_order: lesson.lesson_order,
          created_by: user?.id,
          is_published: true,
        }));

        const { data: createdLessons, error: lessonsError } = await supabase
          .from('lessons')
          .insert(lessonsToInsert)
          .select();

        if (lessonsError) {
          console.error('Error creating lessons:', lessonsError);
        } else if (createdLessons) {
          // Link lessons to course
          const courseLessonsToInsert = createdLessons.map(lesson => ({
            course_id: courseId,
            lesson_id: lesson.id,
            lesson_order: lesson.lesson_order,
          }));

          const { error: linkError } = await supabase
            .from('course_lessons')
            .insert(courseLessonsToInsert);

          if (linkError) {
            console.error('Error linking lessons to course:', linkError);
          }
        }
      }

      toast({
        title: "Course Published",
        description: "Your course has been published successfully!",
      });
      navigate('/my-courses');
    } catch (error) {
      console.error('Error publishing course:', error);
      toast({
        title: "Error",
        description: "Failed to publish course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return courseData.name && courseData.description && courseData.grade_level;
      case 2:
        return courseData.lessons.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  // Allow both admins and teachers to create courses
  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be a teacher or admin to create courses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/my-courses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to My Courses
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-gray-600">Follow the steps to create a comprehensive course</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Course Creation Progress</span>
                <Badge variant="secondary">{currentStep} of {steps.length}</Badge>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border ${
                      step.id === currentStep
                        ? 'border-blue-500 bg-blue-50'
                        : step.id < currentStep
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {step.id < currentStep ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className={`w-4 h-4 rounded-full ${
                          step.id === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                      )}
                      <span className="font-medium text-sm">{step.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <CourseBasicInfo
                courseData={courseData}
                updateCourseData={updateCourseData}
              />
            )}
            {currentStep === 2 && (
              <CourseLessons
                courseData={courseData}
                updateCourseData={updateCourseData}
              />
            )}
            {currentStep === 3 && (
              <CourseSettings
                courseData={courseData}
                updateCourseData={updateCourseData}
              />
            )}
            {currentStep === 4 && (
              <CoursePreview
                courseData={courseData}
                updateCourseData={updateCourseData}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="space-x-2">
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!canProceedToNext()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handlePublishCourse}
                className="bg-green-600 hover:bg-green-700"
              >
                <Eye className="h-4 w-4 mr-2" />
                Publish Course
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
