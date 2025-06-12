
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingUp } from 'lucide-react';

export const TeacherGradebookPage: React.FC = () => {
  const { user } = useAuth();

  if (user?.role !== 'teacher') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Book</h1>
            <p className="text-gray-600">Manage student grades and assessments</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Grade Management
            </CardTitle>
            <CardDescription>
              Grade student assignments and track academic progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Grade book functionality coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
