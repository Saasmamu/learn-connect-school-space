
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  Users, 
  Book, 
  DollarSign, 
  Calendar,
  UserCheck,
  GraduationCap,
  Clock,
  Target
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuth();

  // Mock analytics data - in real app, this would come from Supabase
  const analyticsData = {
    monthlyGrowth: [
      { month: 'Jan', students: 1100, revenue: 22000, teachers: 42 },
      { month: 'Feb', students: 1150, revenue: 23000, teachers: 43 },
      { month: 'Mar', students: 1200, revenue: 24000, teachers: 44 },
      { month: 'Apr', students: 1247, revenue: 24680, teachers: 45 },
    ],
    topPerformingClasses: [
      { name: 'Quran Memorization', students: 125, completion: 95, revenue: 3750 },
      { name: 'Islamic History', students: 98, completion: 88, revenue: 2940 },
      { name: 'Arabic Language', students: 87, completion: 92, revenue: 2610 },
      { name: 'Hadith Studies', students: 76, completion: 85, revenue: 2280 },
    ],
    recentTrends: {
      studentGrowth: '+12%',
      revenueGrowth: '+18%',
      teacherSatisfaction: '94%',
      classCompletion: '89%',
    },
    upcomingEvents: [
      { name: 'Ramadan Special Classes', date: '2024-03-15', type: 'course' },
      { name: 'Teacher Training Workshop', date: '2024-02-20', type: 'training' },
      { name: 'Parent-Teacher Conference', date: '2024-02-25', type: 'meeting' },
      { name: 'Quran Competition', date: '2024-03-01', type: 'event' },
    ]
  };

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Student Growth</p>
                  <p className="text-2xl font-bold text-blue-600">{analyticsData.recentTrends.studentGrowth}</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                  <p className="text-2xl font-bold text-green-600">{analyticsData.recentTrends.revenueGrowth}</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Teacher Satisfaction</p>
                  <p className="text-2xl font-bold text-purple-600">{analyticsData.recentTrends.teacherSatisfaction}</p>
                  <p className="text-xs text-gray-500">avg rating</p>
                </div>
                <UserCheck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{analyticsData.recentTrends.classCompletion}</p>
                  <p className="text-xs text-gray-500">course completion</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly Growth Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Monthly Growth Trends
                </CardTitle>
                <CardDescription>Student enrollment and revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chart visualization</p>
                    <p className="text-sm text-gray-400">Would integrate with recharts library</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                  {analyticsData.monthlyGrowth.map((month) => (
                    <div key={month.month} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-sm">{month.month}</div>
                      <div className="text-xs text-gray-600">{month.students} students</div>
                      <div className="text-xs text-gray-600">${month.revenue}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Classes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5" />
                  Top Performing Classes
                </CardTitle>
                <CardDescription>Classes with highest enrollment and completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPerformingClasses.map((cls, index) => (
                    <div key={cls.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{cls.name}</div>
                          <div className="text-sm text-gray-600">
                            {cls.students} students • {cls.completion}% completion
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-green-600">${cls.revenue}</div>
                        <div className="text-xs text-gray-500">revenue</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Students</span>
                  <Badge variant="default">1,247</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Teachers</span>
                  <Badge variant="default">45</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <Badge variant="default">28</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month Revenue</span>
                  <Badge variant="default">$24,680</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Class Size</span>
                  <Badge variant="secondary">28 students</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Teacher-Student Ratio</span>
                  <Badge variant="secondary">1:28</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-emerald-200 bg-emerald-50 rounded-r-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        event.type === 'course' ? 'bg-blue-500' :
                        event.type === 'training' ? 'bg-green-500' :
                        event.type === 'meeting' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{event.name}</div>
                        <div className="text-xs text-gray-600">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Student Retention</span>
                    <span className="font-semibold">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Completion</span>
                    <span className="font-semibold">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '89%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Teacher Satisfaction</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Success</span>
                    <span className="font-semibold">97%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{width: '97%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
