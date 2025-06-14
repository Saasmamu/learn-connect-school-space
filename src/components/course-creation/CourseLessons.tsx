
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, GripVertical, Play, Clock } from 'lucide-react';
import type { CourseData } from '@/pages/admin/CourseCreationPage';

interface CourseLessonsProps {
  courseData: CourseData;
  updateCourseData: (updates: Partial<CourseData>) => void;
}

interface LessonFormData {
  title: string;
  description: string;
  content: string;
  video_url: string;
  duration_minutes: number;
}

export const CourseLessons: React.FC<CourseLessonsProps> = ({
  courseData,
  updateCourseData
}) => {
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<number | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormData>({
    title: '',
    description: '',
    content: '',
    video_url: '',
    duration_minutes: 0,
  });

  const resetForm = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      video_url: '',
      duration_minutes: 0,
    });
  };

  const handleAddLesson = () => {
    const newLesson = {
      ...lessonForm,
      lesson_order: courseData.lessons.length + 1,
    };
    
    updateCourseData({
      lessons: [...courseData.lessons, newLesson]
    });
    
    resetForm();
    setIsAddingLesson(false);
  };

  const handleEditLesson = (index: number) => {
    const lesson = courseData.lessons[index];
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      video_url: lesson.video_url || '',
      duration_minutes: lesson.duration_minutes || 0,
    });
    setEditingLesson(index);
  };

  const handleUpdateLesson = () => {
    if (editingLesson !== null) {
      const updatedLessons = [...courseData.lessons];
      updatedLessons[editingLesson] = {
        ...updatedLessons[editingLesson],
        ...lessonForm,
      };
      
      updateCourseData({ lessons: updatedLessons });
      resetForm();
      setEditingLesson(null);
    }
  };

  const handleDeleteLesson = (index: number) => {
    const updatedLessons = courseData.lessons.filter((_, i) => i !== index);
    // Reorder lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      lesson_order: i + 1,
    }));
    
    updateCourseData({ lessons: reorderedLessons });
  };

  const moveLesson = (fromIndex: number, toIndex: number) => {
    const updatedLessons = [...courseData.lessons];
    const [movedLesson] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, movedLesson);
    
    // Reorder lessons
    const reorderedLessons = updatedLessons.map((lesson, i) => ({
      ...lesson,
      lesson_order: i + 1,
    }));
    
    updateCourseData({ lessons: reorderedLessons });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Course Lessons</h3>
          <p className="text-gray-600">Add and organize your course content</p>
        </div>
        <Dialog open={isAddingLesson} onOpenChange={setIsAddingLesson}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddingLesson(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lesson</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lesson-title">Lesson Title *</Label>
                <Input
                  id="lesson-title"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Introduction to Prayer"
                />
              </div>
              <div>
                <Label htmlFor="lesson-description">Description</Label>
                <Textarea
                  id="lesson-description"
                  value={lessonForm.description}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the lesson"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="lesson-content">Lesson Content *</Label>
                <Textarea
                  id="lesson-content"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed lesson content and instructions"
                  rows={5}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-url">Video URL (Optional)</Label>
                  <Input
                    id="video-url"
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={lessonForm.duration_minutes}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                    placeholder="30"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingLesson(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddLesson}
                  disabled={!lessonForm.title || !lessonForm.content}
                >
                  Add Lesson
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lessons List */}
      {courseData.lessons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Play className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
            <p className="text-gray-600 mb-4">Start building your course by adding your first lesson.</p>
            <Button onClick={() => setIsAddingLesson(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Lesson
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courseData.lessons.map((lesson, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <Badge variant="secondary">
                        Lesson {lesson.lesson_order}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{lesson.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{lesson.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {lesson.duration_minutes > 0 && (
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {lesson.duration_minutes} min
                          </div>
                        )}
                        {lesson.video_url && (
                          <div className="flex items-center">
                            <Play className="h-3 w-3 mr-1" />
                            Video included
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLesson(index)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLesson(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Lesson Dialog */}
      <Dialog open={editingLesson !== null} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-lesson-title">Lesson Title *</Label>
              <Input
                id="edit-lesson-title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Introduction to Prayer"
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-description">Description</Label>
              <Textarea
                id="edit-lesson-description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the lesson"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-lesson-content">Lesson Content *</Label>
              <Textarea
                id="edit-lesson-content"
                value={lessonForm.content}
                onChange={(e) => setLessonForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Detailed lesson content and instructions"
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-video-url">Video URL (Optional)</Label>
                <Input
                  id="edit-video-url"
                  value={lessonForm.video_url}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={lessonForm.duration_minutes}
                  onChange={(e) => setLessonForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingLesson(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateLesson}
                disabled={!lessonForm.title || !lessonForm.content}
              >
                Update Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
