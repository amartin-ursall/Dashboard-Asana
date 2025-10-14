import { useMemo } from 'react';
import { AsanaTask } from '@/types/asana';
import { subDays, format, isAfter, parseISO } from 'date-fns';
import { ListTodo, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export function useDashboardData(tasks: AsanaTask[] | undefined) {
  return useMemo(() => {
    const taskList = tasks || [];

    if (!taskList || taskList.length === 0) {
      return {
        kpis: [
          { title: 'Total de Tareas', value: 0, icon: ListTodo, color: 'text-blue-500' },
          { title: 'Completadas', value: 0, icon: CheckCircle, color: 'text-green-500' },
          { title: 'Vencidas', value: 0, icon: AlertTriangle, color: 'text-red-500' },
          { title: 'En Progreso', value: 0, icon: Clock, color: 'text-yellow-500' },
        ],
        weeklyTrend: [],
        taskStatus: [],
      };
    }

    const now = new Date();
    const completedTasks = taskList.filter(t => t.completed);
    const overdueTasks = taskList.filter(t => !t.completed && t.due_on && isAfter(now, parseISO(t.due_on)));
    const inProgressTasks = taskList.filter(t => !t.completed);

    const kpis = [
      { title: 'Total de Tareas', value: taskList.length, icon: ListTodo, color: 'text-blue-500' },
      { title: 'Completadas', value: completedTasks.length, icon: CheckCircle, color: 'text-green-500' },
      { title: 'Vencidas', value: overdueTasks.length, icon: AlertTriangle, color: 'text-red-500' },
      { title: 'En Progreso', value: inProgressTasks.length, icon: Clock, color: 'text-yellow-500' },
    ];

    const weeklyTrend = [...Array(7)].map((_, i) => {
      const date = subDays(now, 6 - i);
      return {
        name: format(date, 'EEE'),
        completed: taskList.filter(t =>
          t.completed &&
          t.due_on &&
          format(parseISO(t.due_on), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ).length,
        created: 0,
      };
    });

    const taskStatus = [
      { name: 'En Progreso', value: inProgressTasks.length },
      { name: 'Completadas', value: completedTasks.length },
      { name: 'Vencidas', value: overdueTasks.length },
    ];

    return { kpis, weeklyTrend, taskStatus };
  }, [tasks]);
}
