import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAsanaTasks } from '@/hooks/useAsanaApi';
import { useDashboardData } from '@/hooks/business/useDashboardData';
import { useUIStore } from '@/stores/ui.store';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
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
// Use theme-aware colors that respect light/dark mode
const getChartColors = () => {
  const style = getComputedStyle(document.documentElement);
  return [
    `hsl(${style.getPropertyValue('--chart-1')})`,
    `hsl(${style.getPropertyValue('--chart-2')})`,
    `hsl(${style.getPropertyValue('--chart-3')})`,
    `hsl(${style.getPropertyValue('--chart-4')})`,
    `hsl(${style.getPropertyValue('--chart-5')})`,
  ];
};
export function DashboardPage() {
  const { data: tasksData, isLoading, isError, error } = useAsanaTasks();
  const chartColors = useMemo(() => getChartColors(), []);
  const dashboardData = useDashboardData(tasksData?.data);

  const kpisCollapsed = useUIStore(s => s.dashboardSectionsCollapsed.kpis);
  const chartsCollapsed = useUIStore(s => s.dashboardSectionsCollapsed.charts);
  const toggleDashboardSection = useUIStore(s => s.toggleDashboardSection);
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
          <AlertTitle>Error al cargar los datos del tablero</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Ocurrió un error desconocido."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        {/* KPIs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Métricas Clave</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDashboardSection('kpis')}
              className="gap-2"
            >
              {kpisCollapsed ? (
                <>
                  <span className="text-sm">Mostrar</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-sm">Ocultar</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {!kpisCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {dashboardData.kpis.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                          <item.icon className={`h-5 w-5 ${item.color}`} />
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{item.value}</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Charts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Análisis</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleDashboardSection('charts')}
              className="gap-2"
            >
              {chartsCollapsed ? (
                <>
                  <span className="text-sm">Mostrar</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-sm">Ocultar</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {!chartsCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                  <motion.div
                    className="lg:col-span-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <CardTitle>Tareas Completadas (Últimos 7 Días)</CardTitle>
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
                  </motion.div>
                  <motion.div
                    className="lg:col-span-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
                      <CardHeader>
                        <CardTitle>Distribución de Estado de Tareas</CardTitle>
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
                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
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
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}