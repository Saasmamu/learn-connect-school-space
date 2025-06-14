
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, Target, Users } from 'lucide-react';
import { useLearningAnalytics } from '@/hooks/useLearningAnalytics';

interface PerformanceDashboardProps {
  classId?: string;
  userId?: string;
  isTeacherView?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  classId,
  userId,
  isTeacherView = false
}) => {
  const { metrics, analytics, metricsLoading } = useLearningAnalytics(classId);

  const getLatestMetrics = () => {
    if (!metrics || metrics.length === 0) return {};
    
    const latest = metrics.reduce((acc, metric) => {
      if (!acc[metric.metric_type] || new Date(metric.calculation_date) > new Date(acc[metric.metric_type].calculation_date)) {
        acc[metric.metric_type] = metric;
      }
      return acc;
    }, {} as any);
    
    return latest;
  };

  const latestMetrics = getLatestMetrics();

  const getMetricTrend = (metricType: string) => {
    if (!metrics) return [];
    return metrics
      .filter(m => m.metric_type === metricType)
      .slice(0, 7)
      .reverse()
      .map(m => ({
        date: new Date(m.calculation_date).toLocaleDateString(),
        value: Number(m.value)
      }));
  };

  if (metricsLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(latestMetrics.engagement?.value || 0)}%
            </div>
            <Progress value={latestMetrics.engagement?.value || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comprehension</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(latestMetrics.comprehension?.value || 0)}%
            </div>
            <Progress value={latestMetrics.comprehension?.value || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(latestMetrics.participation?.value || 0)}
            </div>
            <Badge variant="outline" className="mt-2">
              Posts/Messages
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(latestMetrics.progress?.value || 0)}%
            </div>
            <Progress value={latestMetrics.progress?.value || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Trends Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Engagement Trend</CardTitle>
            <CardDescription>Last 7 days of engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getMetricTrend('engagement')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
            <CardDescription>Weekly progress overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getMetricTrend('progress')}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
