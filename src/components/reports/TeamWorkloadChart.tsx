import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AsanaTask } from '@/types/asana';
interface TeamWorkloadChartProps {
  tasks: AsanaTask[];
}
export function TeamWorkloadChart({ tasks }: TeamWorkloadChartProps) {
  const workloadData = useMemo(() => {
    const openTasks = tasks.filter(task => !task.completed);
    const userTaskCounts: { [key: string]: number } = {};
    openTasks.forEach(task => {
      const assigneeName = task.assignee?.name || 'Unassigned';
      userTaskCounts[assigneeName] = (userTaskCounts[assigneeName] || 0) + 1;
    });
    return Object.entries(userTaskCounts)
      .map(([name, tasks]) => ({ name, tasks }))
      .sort((a, b) => b.tasks - a.tasks);
  }, [tasks]);
  if (workloadData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No open tasks to display.</div>;
  }
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={workloadData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis 
            type="category" 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            width={80}
            tick={{ textAnchor: 'end' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar dataKey="tasks" fill="hsl(var(--accent))" name="Open Tasks" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}