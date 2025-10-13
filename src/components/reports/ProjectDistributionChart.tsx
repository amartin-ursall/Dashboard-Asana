import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AsanaTask } from '@/types/asana';
interface ProjectDistributionChartProps {
  tasks: AsanaTask[];
}
const COLORS = ['#4F46E5', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#D946EF'];
export function ProjectDistributionChart({ tasks }: ProjectDistributionChartProps) {
  const projectData = useMemo(() => {
    const projectCounts: { [key: string]: number } = {};
    tasks.forEach(task => {
      if (task.projects.length > 0) {
        task.projects.forEach(project => {
          projectCounts[project.name] = (projectCounts[project.name] || 0) + 1;
        });
      } else {
        projectCounts['No Project'] = (projectCounts['No Project'] || 0) + 1;
      }
    });
    return Object.entries(projectCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tasks]);
  if (projectData.length === 0) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No project data available.</div>;
  }
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={projectData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {projectData.map((entry, index) => (
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
          <Legend wrapperStyle={{fontSize: "12px", overflow: "auto", maxHeight: "80px"}} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}