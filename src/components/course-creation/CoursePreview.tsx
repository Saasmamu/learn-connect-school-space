
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Calendar, 
  Play, 
  Clock,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import type { CourseData } from '@/pages/admin/CourseCreationPage';

interface CoursePreviewProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const CoursePreview: React.FC<CoursePreviewProps> = ({
  courseData,
  updateCourseData
}) => {
  const totalDuration = courseData.lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
  const lessonsWithVideo = courseData.lessons.filter(lesson => lesson.video_url).length;

  const publishingChecklist = [
    {
      check: courseData.name.length > 0,
      label: 'Course name provided',
      required: true
    },
    {
      check: courseData.description.length > 0,
      label: 'Course description provided',
      required: true
    },
    {
      check: courseData.grade_level.length > 0,
      label: 'Grade level selected',
      required: true
    },
    {
      check: courseData.lessons.length > 0,
      label: 'At least one lesson added',
      required: true
    },
    {
      check: courseData.lessons.every(lesson => lesson.title && lesson.content),
      label: 'All lessons have title and content',
      required: true
    },
    {
      check: lessonsWithVideo > 0,
      label: 'At least one lesson has video content',
      required: false
    },
    {
      check: totalDuration > 0,
      label: 'Lesson durations specified',
      required: false
    }
  ];

  const requiredChecks = publishingChecklist.filter(item => item.required);
  const completedRequired = requiredChecks.filter(item => item.check).length;
  const canPublish = completedRequired === requiredChecks.length;

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {courseData.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {courseData.description}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {courseData.settings.is_published ? (
                <Badge className="bg-green-100 text-green-800">
                  <Globe className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
              <Badge variant="outline">
                <GraduationCap className="h-3 w-3 mr-1" />
                {courseData.grade_level}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {courseData.lessons.length}
              </div>
              <div className="text-sm text-blue-800">Lessons</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(totalDuration / 60 * 10) / 10}h
              </div>
              <div className="text-sm text-green-800">Total Duration</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {lessonsWithVideo}
              </div>
              <div className="text-sm text-purple-800">Video Lessons</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Course Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enrollment Limit:</span>
            <span className="font-medium">
              {courseData.settings.enrollment_limit || 'Unlimited'}
            </span>
          </div>
          {courseData.settings.start_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Start Date:</span>
              <span className="font-medium">
                {format(new Date(courseData.settings.start_date), 'PPP')}
              </span>
            </div>
          )}
          {courseData.settings.end_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">End Date:</span>
              <span className="font-medium">
                {format(new Date(courseData.settings.end_date), 'PPP')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lessons Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Course Lessons</CardTitle>
          <CardDescription>
            Preview of all lessons in this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseData.lessons.map((lesson, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <Badge variant="secondary">
                  {lesson.lesson_order}
                </Badge>
                <div className="flex-1">
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-sm text-gray-600">{lesson.description}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  {lesson.video_url && (
                    <div className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      Video
                    </div>
                  )}
                  {lesson.duration_minutes > 0 && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {lesson.duration_minutes}m
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Publishing Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing Checklist</CardTitle>
          <CardDescription>
            Review these items before publishing your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {publishingChecklist.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                {item.check ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className={`h-4 w-4 rounded-full border-2 ${
                    item.required ? 'border-red-300' : 'border-gray-300'
                  }`} />
                )}
                <span className={`text-sm ${item.check ? 'text-gray-900' : 'text-gray-600'}`}>
                  {item.label}
                </span>
                {item.required && !item.check && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
            ))}
          </div>
          
          {!canPublish && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Please complete all required items before publishing
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
