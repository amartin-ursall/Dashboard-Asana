import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { AsanaTasksResponse, AsanaWorkspaceResponse, AsanaProjectsResponse, AsanaProjectDetailResponse } from '@/types/asana';
export function useAsanaWorkspaces() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return useQuery({
    queryKey: ['asanaWorkspaces'],
    queryFn: () => api.get<AsanaWorkspaceResponse>('/api/asana/workspaces'),
    enabled: isAuthenticated,
    staleTime: Infinity, // Workspaces rarely change
  });
}
export function useAsanaProjects() {
  const selectedWorkspaceGid = useWorkspaceStore(s => s.selectedWorkspaceGid);
  return useQuery({
    queryKey: ['asanaProjects', selectedWorkspaceGid],
    queryFn: () => api.get<AsanaProjectsResponse>(`/api/asana/projects?workspace_gid=${selectedWorkspaceGid}`),
    enabled: !!selectedWorkspaceGid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useAsanaTasks() {
  const user = useAuthStore(s => s.user);
  const selectedWorkspaceGid = useWorkspaceStore(s => s.selectedWorkspaceGid);
  const userGid = user?.gid;
  return useQuery({
    queryKey: ['asanaTasks', userGid, selectedWorkspaceGid],
    queryFn: async () => {
      if (!userGid || !selectedWorkspaceGid) {
        throw new Error("User or workspace not available");
      }
      return api.get<AsanaTasksResponse>(`/api/asana/tasks?user_gid=${userGid}&workspace_gid=${selectedWorkspaceGid}`);
    },
    enabled: !!userGid && !!selectedWorkspaceGid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useAsanaProjectDetails(projectId?: string) {
  return useQuery({
    queryKey: ['asanaProjectDetails', projectId],
    queryFn: () => api.get<AsanaProjectDetailResponse>(`/api/asana/projects/${projectId}`),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
export function useAsanaTasksForProject(projectId?: string) {
  return useQuery({
    queryKey: ['asanaTasksForProject', projectId],
    queryFn: () => api.get<AsanaTasksResponse>(`/api/asana/projects/${projectId}/tasks`),
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}