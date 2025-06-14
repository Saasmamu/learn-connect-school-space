
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Settings, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { CourseData } from '@/pages/admin/CourseCreationPage';

interface CourseSettingsProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

export const CourseSettings: React.FC<CourseSettingsProps> = ({
  courseData,
  updateCourseData
}) => {
  const updateSettings = (updates: Partial<CourseData['settings']>) => {
    updateCourseData({
      settings: { ...courseData.settings, ...updates }
    });
  };

  return (
    <div className="space-y-6">
      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Publishing Settings
          </CardTitle>
          <CardDescription>
            Control when and how your course becomes available to students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is-published">Publish Course</Label>
              <p className="text-sm text-gray-600">
                Make this course visible and available to students
              </p>
            </div>
            <Switch
              id="is-published"
              checked={courseData.settings.is_published}
              onCheckedChange={(checked) => updateSettings({ is_published: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Enrollment Settings
          </CardTitle>
          <CardDescription>
            Configure enrollment limits and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="enrollment-limit">Enrollment Limit (Optional)</Label>
            <Input
              id="enrollment-limit"
              type="number"
              placeholder="e.g., 30"
              value={courseData.settings.enrollment_limit || ''}
              onChange={(e) => updateSettings({ 
                enrollment_limit: e.target.value ? parseInt(e.target.value) : undefined 
              })}
            />
            <p className="text-sm text-gray-600 mt-1">
              Leave empty for unlimited enrollment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Course Schedule
          </CardTitle>
          <CardDescription>
            Set start and end dates for your course (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {courseData.settings.start_date
                      ? format(new Date(courseData.settings.start_date), 'PPP')
                      : 'Select start date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={courseData.settings.start_date ? new Date(courseData.settings.start_date) : undefined}
                    onSelect={(date) => updateSettings({ 
                      start_date: date ? date.toISOString().split('T')[0] : undefined 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {courseData.settings.end_date
                      ? format(new Date(courseData.settings.end_date), 'PPP')
                      : 'Select end date'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={courseData.settings.end_date ? new Date(courseData.settings.end_date) : undefined}
                    onSelect={(date) => updateSettings({ 
                      end_date: date ? date.toISOString().split('T')[0] : undefined 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Course dates help students understand the timeline and pacing
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
