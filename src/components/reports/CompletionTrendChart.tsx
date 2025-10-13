import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AsanaTask } from '@/types/asana';
import { subDays, format, parseISO, isWithinInterval } from 'date-fns';
interface CompletionTrendChartProps {
  tasks: AsanaTask[];
}
export function CompletionTrendChart({ tasks }: CompletionTrendChartProps) {
  const trendData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 29);
    const completedTasksLast30Days = tasks.filter(task => 
      task.completed && 
      task.due_on && 
      isWithinInterval(parseISO(task.due_on), { start: thirtyDaysAgo, end: now })
    );
    const data = [...Array(30)].map((_, i) => {
      const date = subDays(now, 29 - i);
      const formattedDate = format(date, 'MMM d');
      const count = completedTasksLast30Days.filter(
        task => format(parseISO(task.due_on!), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      return { name: formattedDate, completed: count };
    });
    return data;
  }, [tasks]);
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            allowDecimals={false}
          />
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
    </div>
  );
}