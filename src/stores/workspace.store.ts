import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AsanaWorkspace } from '@/types/asana';
interface WorkspaceState {
  workspaces: AsanaWorkspace[];
  selectedWorkspaceGid: string | null;
  setWorkspaces: (workspaces: AsanaWorkspace[]) => void;
  setSelectedWorkspaceGid: (gid: string) => void;
}
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      selectedWorkspaceGid: null,
      setWorkspaces: (workspaces) => {
        set({ workspaces });
        // If no workspace is selected, or the selected one is no longer valid, select the first one.
        const currentGid = get().selectedWorkspaceGid;
        if (!currentGid || !workspaces.some(w => w.gid === currentGid)) {
          if (workspaces.length > 0) {
            set({ selectedWorkspaceGid: workspaces[0].gid });
          }
        }
      },
      setSelectedWorkspaceGid: (gid) => set({ selectedWorkspaceGid: gid }),
    }),
    {
      name: 'zendash-workspace-storage', // name of the item in the storage (must be unique)
    }
  )
);