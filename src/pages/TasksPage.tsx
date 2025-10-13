import { useAsanaTasks } from "@/hooks/useAsanaApi";
import { AsanaTask } from "@/types/asana";
import { createTaskColumns } from "@/components/tasks/columns";
import { DataTable } from "@/components/tasks/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Inbox } from "lucide-react";
function TasksLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[80px]" />
      </div>
      <div className="rounded-md border">
        <div className="w-full space-y-2 p-4">
          <Skeleton className="h-8 w-full" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-8 w-[250px]" />
      </div>
    </div>
  );
}
export function TasksPage() {
  const { data, isLoading, isError, error } = useAsanaTasks();
  const tasks: AsanaTask[] = data?.data || [];
  const columns = createTaskColumns();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        {isLoading && <TasksLoadingSkeleton />}
        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error fetching tasks</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "An unknown error occurred."}
            </AlertDescription>
          </Alert>
        )}
        {!isLoading && !isError && (
          <>
            {tasks.length > 0 ? (
              <DataTable columns={columns} data={tasks} />
            ) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No tasks found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  It looks like you don't have any tasks assigned to you in this workspace.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}