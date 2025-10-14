import { useAsanaProjects } from "@/hooks/useAsanaApi";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, FolderSearch } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { PageContainer } from "@/components/common/PageContainer";
import { motion } from "framer-motion";
function ProjectsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
export function ProjectsPage() {
  const { data, isLoading, isError, error } = useAsanaProjects();
  const projects = data?.data || [];
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        {isLoading && <ProjectsLoadingSkeleton />}
        {isError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar los proyectos</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : "Ocurrió un error desconocido."}
            </AlertDescription>
          </Alert>
        )}
        {!isLoading && !isError && (
          <>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project, index) => (
                  <motion.div
                    key={project.gid}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={FolderSearch}
                title="No se encontraron proyectos"
                description="No hay proyectos en el espacio de trabajo seleccionado."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}