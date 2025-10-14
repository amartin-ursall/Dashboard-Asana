import { useParams } from 'react-router-dom';
import { useAsanaProjectDetails, useAsanaTasksForProject } from '@/hooks/useAsanaApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Clock, ListTodo } from 'lucide-react';
import { DataTable } from '@/components/tasks/DataTable';
import { createTaskColumns } from '@/components/tasks/columns';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
function ProjectDetailLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}
const COLORS = ['#82ca9d', '#ffc658', '#ff8042'];
export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: projectData, isLoading: isLoadingProject, isError: isErrorProject, error: errorProject } = useAsanaProjectDetails(projectId);
  const { data: tasksData, isLoading: isLoadingTasks, isError: isErrorTasks, error: errorTasks } = useAsanaTasksForProject(projectId);
  const isLoading = isLoadingProject || isLoadingTasks;
  const isError = isErrorProject || isErrorTasks;
  const error = errorProject || errorTasks;
  const project = projectData?.data;
  const tasks = tasksData?.data || [];
  const columns = useMemo(() => createTaskColumns({ hideProjectColumn: true }), []);
  const projectStats = useMemo(() => {
    const currentTasks = tasksData?.data || [];
    if (!currentTasks) {
        return {
            kpis: [],
            taskStatusDistribution: []
        };
    }
    const completedTasks = currentTasks.filter(t => t.completed);
    const inProgressTasks = currentTasks.filter(t => !t.completed);
    const overdueTasks = currentTasks.filter(t => !t.completed && t.due_on && new Date(t.due_on) < new Date());
    const kpis = [
      { title: 'Total de Tareas', value: currentTasks.length, icon: ListTodo, color: 'text-blue-500' },
      { title: 'Completadas', value: completedTasks.length, icon: CheckCircle, color: 'text-green-500' },
      { title: 'En Progreso', value: inProgressTasks.length, icon: Clock, color: 'text-yellow-500' },
      { title: 'Vencidas', value: overdueTasks.length, icon: AlertTriangle, color: 'text-red-500' },
    ];
    const taskStatusDistribution = [
      { name: 'Completadas', value: completedTasks.length },
      { name: 'En Progreso', value: inProgressTasks.length },
      { name: 'Vencidas', value: overdueTasks.length },
    ].filter(item => item.value > 0); // Filter out zero-value items for a cleaner chart
    return { kpis, taskStatusDistribution };
  }, [tasksData?.data]);
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <ProjectDetailLoadingSkeleton />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar los datos del proyecto</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Ocurrió un error desconocido."}</AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-6">{project?.name}</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {projectStats.kpis.map((item) => (
            <Card key={item.title}>
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
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">Tareas</h2>
            <DataTable columns={columns} data={tasks} />
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Estado de las Tareas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectStats.taskStatusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStats.taskStatusDistribution.map((entry, index) => (
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}