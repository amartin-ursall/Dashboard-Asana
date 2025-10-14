"use client"
import { ColumnDef } from "@tanstack/react-table"
import { AsanaTask } from "@/types/asana"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, parseISO } from 'date-fns'
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};
interface CreateTaskColumnsOptions {
  hideProjectColumn?: boolean;
}
export const createTaskColumns = (options: CreateTaskColumnsOptions = {}): ColumnDef<AsanaTask>[] => {
  const columns: ColumnDef<AsanaTask>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected()
              ? true
              : table.getIsSomePageRowsSelected()
              ? "indeterminate"
              : false
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nombre de Tarea
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const task = row.original;
        return (
          <div className="flex items-center">
            <a href={task.permalink_url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline flex items-center gap-2 group">
              {task.name}
              <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        )
      }
    },
    {
      accessorKey: "assignee",
      header: "Asignado a",
      cell: ({ row }) => {
        const assignee = row.original.assignee;
        if (!assignee) return <span className="text-muted-foreground">Sin asignar</span>;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.photo?.image_60x60} alt={assignee.name} />
              <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
            </Avatar>
            <span>{assignee.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "due_on",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha de Vencimiento
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const due_on = row.getValue("due_on") as string | null;
        if (!due_on) return <span className="text-muted-foreground">—</span>;
        return <span>{format(parseISO(due_on), 'MMM d, yyyy')}</span>;
      },
    },
    {
      accessorKey: "projects",
      header: "Proyectos",
      cell: ({ row }) => {
        const projects = row.original.projects;
        if (!projects || projects.length === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {projects.slice(0, 2).map(p => <Badge key={p.gid} variant="secondary">{p.name}</Badge>)}
            {projects.length > 2 && <Badge variant="outline">+{projects.length - 2}</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: "completed",
      header: "Estado",
      cell: ({ row }) => {
        const isCompleted = row.getValue("completed");
        return isCompleted ? <Badge variant="default" className="bg-green-500/20 text-green-700 hover:bg-green-500/30 dark:bg-green-500/10 dark:text-green-400">Completada</Badge> : <Badge variant="outline">Abierta</Badge>;
      },
    },
  ];
  if (options.hideProjectColumn) {
    return columns.filter(c => (c as { accessorKey?: string }).accessorKey !== 'projects');
  }
  return columns;
}