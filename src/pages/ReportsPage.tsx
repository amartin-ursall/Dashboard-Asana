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
          <AlertTitle>Error fetching report data</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "An unknown error occurred."}
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
          <h3 className="mt-4 text-lg font-medium">Not enough data for reports</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Once you have more tasks in this workspace, reports will be generated here.
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
            title="Task Completion Trend"
            description="Completed tasks over the last 30 days."
          >
            <CompletionTrendChart tasks={tasks} />
          </ReportCard>
          <ReportCard
            title="Project Distribution"
            description="How tasks are distributed across projects."
          >
            <ProjectDistributionChart tasks={tasks} />
          </ReportCard>
          <ReportCard
            title="Team Workload"
            description="Open tasks assigned to each team member."
          >
            <TeamWorkloadChart tasks={tasks} />
          </ReportCard>
        </div>
      </div>
    </div>
  );
}