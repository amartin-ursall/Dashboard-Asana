import { useAsanaTasks, useAsanaProjects } from "@/hooks/useAsanaApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { ReportCard } from "@/components/reports/ReportCard";
import { CompletionTrendChart } from "@/components/reports/CompletionTrendChart";
import { ProjectDistributionChart } from "@/components/reports/ProjectDistributionChart";
import { TeamWorkloadChart } from "@/components/reports/TeamWorkloadChart";
function ReportsLoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
  );
}
export function ReportsPage() {
  const { data: tasksData, isLoading: isLoadingTasks, isError: isErrorTasks, error: errorTasks } = useAsanaTasks();
  const { data: projectsData, isLoading: isLoadingProjects, isError: isErrorProjects, error: errorProjects } = useAsanaProjects();
  const isLoading = isLoadingTasks || isLoadingProjects;
  const isError = isErrorTasks || isErrorProjects;
  const error = errorTasks || errorProjects;
  const tasks = tasksData?.data || [];
  const projects = projectsData?.data || [];
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <ReportsLoadingSkeleton />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error al cargar los datos del reporte</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Ocurrió un error desconocido."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (tasks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No hay suficientes datos para generar reportes</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Una vez que tengas más tareas en este espacio de trabajo, los reportes se generarán aquí.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          <ReportCard
            title="Tendencia de Finalización de Tareas"
            description="Tareas completadas en los últimos 30 días."
          >
            <CompletionTrendChart tasks={tasks} />
          </ReportCard>
          <ReportCard
            title="Distribución de Proyectos"
            description="Cómo se distribuyen las tareas entre los proyectos."
          >
            <ProjectDistributionChart tasks={tasks} />
          </ReportCard>
          <ReportCard
            title="Carga de Trabajo del Equipo"
            description="Tareas abiertas asignadas a cada miembro del equipo."
          >
            <TeamWorkloadChart tasks={tasks} />
          </ReportCard>
        </div>
      </div>
    </div>
  );
}