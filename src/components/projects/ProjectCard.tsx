import { AsanaProjectDetails } from "@/types/asana";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User, Calendar } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { Link } from "react-router-dom";
interface ProjectCardProps {
  project: AsanaProjectDetails;
}
const asanaColors: { [key: string]: string } = {
  'dark-red': 'bg-red-500',
  'dark-orange': 'bg-orange-500',
  'light-orange': 'bg-yellow-400',
  'dark-brown': 'bg-amber-700',
  'light-green': 'bg-lime-500',
  'dark-green': 'bg-green-600',
  'dark-teal': 'bg-teal-500',
  'dark-blue': 'bg-blue-600',
  'dark-purple': 'bg-purple-600',
  'dark-pink': 'bg-pink-600',
  'dark-grey': 'bg-gray-500',
  'light-pink': 'bg-pink-300',
  'light-yellow': 'bg-yellow-300',
  'light-warm-gray': 'bg-stone-400',
  'none': 'bg-gray-300',
};
const getStatusColor = (color: string) => {
  switch (color) {
    case 'green': return 'bg-green-500';
    case 'yellow': return 'bg-yellow-500';
    case 'red': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}
export function ProjectCard({ project }: ProjectCardProps) {
  const projectColorClass = project.color ? asanaColors[project.color] || 'bg-gray-300' : 'bg-gray-300';
  return (
    <Link to={`/projects/${project.gid}`} className="block group">
      <Card className="flex flex-col h-full group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-200">
        <CardHeader className="pb-4">
          <div className={`h-2 w-12 rounded-full ${projectColorClass} mb-3`}></div>
          <CardTitle className="text-lg font-semibold leading-tight">
            <div className="flex items-start justify-between">
              <span>{project.name}</span>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => { e.preventDefault(); window.open(project.permalink_url, '_blank'); }} />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            {project.current_status && (
              <Badge variant="outline" className="mb-4">
                <span className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(project.current_status.color)}`}></span>
                {project.current_status.title}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-2 mt-2">
            {project.owner && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{project.owner.name}</span>
              </div>
            )}
            {project.due_on && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Due by {format(parseISO(project.due_on), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}