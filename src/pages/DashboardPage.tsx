import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, AlertTriangle, Clock, ListTodo } from 'lucide-react';
import { useAsanaTasks } from '@/hooks/useAsanaApi';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { subDays, format, isAfter, parseISO } from 'date-fns';
function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[420px]" />
        <Skeleton className="lg:col-span-3 h-[420px]" />
      </div>
    </div>
  );
}
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
export function DashboardPage() {
  const { data: tasksData, isLoading, isError, error } = useAsanaTasks();
  const dashboardData = useMemo(() => {
    const tasks = tasksData?.data || [];
    if (!tasks || tasks.length === 0) {
      return {
        kpis: [
          { title: 'Total Tasks', value: 0, icon: ListTodo, color: 'text-blue-500' },
          { title: 'Completed', value: 0, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Overdue', value: 0, icon: AlertTriangle, color: 'text-red-500' },
          { title: 'In Progress', value: 0, icon: Clock, color: 'text-yellow-500' },
        ],
        weeklyTrend: [],
        taskStatus: [],
      };
    }
    const now = new Date();
    const completedTasks = tasks.filter(t => t.completed);
    const overdueTasks = tasks.filter(t => !t.completed && t.due_on && isAfter(now, parseISO(t.due_on)));
    const inProgressTasks = tasks.filter(t => !t.completed);
    const kpis = [
      { title: 'Total Tasks', value: tasks.length, icon: ListTodo, color: 'text-blue-500' },
      { title: 'Completed', value: completedTasks.length, icon: CheckCircle, color: 'text-green-500' },
      { title: 'Overdue', value: overdueTasks.length, icon: AlertTriangle, color: 'text-red-500' },
      { title: 'In Progress', value: inProgressTasks.length, icon: Clock, color: 'text-yellow-500' },
    ];
    const weeklyTrend = [...Array(7)].map((_, i) => {
      const date = subDays(now, 6 - i);
      return {
        name: format(date, 'EEE'),
        completed: tasks.filter(t => t.completed && t.due_on && format(parseISO(t.due_on), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length,
        created: 0, // Asana API for tasks doesn't easily provide creation date in this context
      };
    });
    const taskStatus = [
      { name: 'In Progress', value: inProgressTasks.length },
      { name: 'Completed', value: completedTasks.length },
      { name: 'Overdue', value: overdueTasks.length },
    ];
    return { kpis, weeklyTrend, taskStatus };
  }, [tasksData]);
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <DashboardLoadingSkeleton />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error fetching dashboard data</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "An unknown error occurred."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.kpis.map((item) => (
            <Card key={item.title} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Tasks Completed (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dashboardData.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3 hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dashboardData.taskStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {dashboardData.taskStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Legend wrapperStyle={{fontSize: "14px"}}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}