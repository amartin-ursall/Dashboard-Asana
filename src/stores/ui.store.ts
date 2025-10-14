import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  dashboardSectionsCollapsed: {
    kpis: boolean;
    charts: boolean;
  };
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDashboardSection: (section: 'kpis' | 'charts') => void;
  setDashboardSectionCollapsed: (section: 'kpis' | 'charts', collapsed: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      dashboardSectionsCollapsed: {
        kpis: false,
        charts: false,
      },
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),
      toggleDashboardSection: (section) =>
        set((state) => ({
          dashboardSectionsCollapsed: {
            ...state.dashboardSectionsCollapsed,
            [section]: !state.dashboardSectionsCollapsed[section],
          },
        })),
      setDashboardSectionCollapsed: (section, collapsed) =>
        set((state) => ({
          dashboardSectionsCollapsed: {
            ...state.dashboardSectionsCollapsed,
            [section]: collapsed,
          },
        })),
    }),
    {
      name: 'zendash-ui-storage',
    }
  )
);
