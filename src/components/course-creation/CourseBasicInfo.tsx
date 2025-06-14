
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, GraduationCap, FileText } from 'lucide-react';
import type { CourseData } from '@/pages/admin/CourseCreationPage';

interface CourseBasicInfoProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const CourseBasicInfo: React.FC<CourseBasicInfoProps> = ({
  courseData,
  updateCourseData
}) => {
  const gradeLevels = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Adult Education', 'General'
  ];

  return (
    <div className="space-y-6">
      {/* Course Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Course Name
          </CardTitle>
          <CardDescription>
            Choose a clear and descriptive name for your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="course-name">Course Name *</Label>
            <Input
              id="course-name"
              placeholder="e.g., Introduction to Islamic Studies"
              value={courseData.name}
              onChange={(e) => updateCourseData({ name: e.target.value })}
              className="text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Course Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Course Description
          </CardTitle>
          <CardDescription>
            Provide a detailed description of what students will learn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="course-description">Description *</Label>
            <Textarea
              id="course-description"
              placeholder="Describe the course objectives, learning outcomes, and what students can expect..."
              value={courseData.description}
              onChange={(e) => updateCourseData({ description: e.target.value })}
              rows={5}
            />
            <p className="text-sm text-gray-500">
              {courseData.description.length}/500 characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Grade Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2" />
            Grade Level
          </CardTitle>
          <CardDescription>
            Select the appropriate grade level for this course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="grade-level">Grade Level *</Label>
            <Select
              value={courseData.grade_level}
              onValueChange={(value) => updateCourseData({ grade_level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
