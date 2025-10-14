import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderKanban, Bot, Settings, BarChart3, PanelLeftClose, PanelLeft, Building, ExternalLink, LogOut, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore, UserProfile } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useAsanaWorkspaces } from '@/hooks/useAsanaApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoutConfirmationDialog } from './LogoutConfirmationDialog';
import { Separator } from '@/components/ui/separator';

const navigation = [
  { name: 'Tablero', href: '/', icon: LayoutDashboard },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
  { name: 'Proyectos', href: '/projects', icon: FolderKanban },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Chat IA', href: '/chat', icon: Bot },
];

const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};

function WorkspaceSelector({ collapsed = false }: { collapsed?: boolean }) {
  const { data: workspaceData, isLoading } = useAsanaWorkspaces();
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const selectedWorkspaceGid = useWorkspaceStore((state) => state.selectedWorkspaceGid);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setSelectedWorkspaceGid = useWorkspaceStore((state) => state.setSelectedWorkspaceGid);
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  useEffect(() => {
    if (workspaceData?.data) {
      setWorkspaces(workspaceData.data);
    }
  }, [workspaceData, setWorkspaces]);

  if (isLoading) {
    return <Skeleton className={cn("h-8", collapsed ? "w-8" : "w-full")} />;
  }

  if (!workspaces || workspaces.length === 0) {
    return null;
  }

  if (collapsed) {
    return (
      <Button
        variant="ghost"
        className="w-full h-8 flex items-center justify-center"
        title="Workspace"
        onClick={() => {
          setSidebarCollapsed(false);
          // Open the selector after expanding
          setTimeout(() => {
            const trigger = document.getElementById('workspace-select-trigger');
            trigger?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }, 50);
        }}
      >
        <Building className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Select value={selectedWorkspaceGid || ''} onValueChange={setSelectedWorkspaceGid}>
      <SelectTrigger id="workspace-select-trigger" className="w-full h-8">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          <SelectValue placeholder="Seleccionar espacio" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {workspaces.map((ws) => (
          <SelectItem key={ws.gid} value={ws.gid}>
            {ws.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function UserNav({ user, onLogout, collapsed = false }: { user: UserProfile; onLogout: () => void; collapsed?: boolean }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  if (collapsed) {
    return (
      <>
        <LogoutConfirmationDialog
          open={isLogoutDialogOpen}
          onOpenChange={setIsLogoutDialogOpen}
          onConfirm={onLogout}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full h-8 flex items-center justify-center rounded-full bg-transparent hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photo} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="right">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="https://app.asana.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Ir a Asana</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return (
    <>
      <LogoutConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={onLogout}
      />
      <div className="flex items-center gap-3 px-3 py-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.photo} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-none truncate">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground truncate mt-1">{user.email}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <UserCog className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" side="right">
            <DropdownMenuItem asChild>
              <a href="https://app.asana.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Ir a Asana</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

function SidebarContent({ onNavigate, collapsed = false }: { onNavigate?: () => void; collapsed?: boolean }) {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Logo and Toggle */}
      <div className={cn("flex items-center flex-shrink-0 gap-3 pt-5 pb-4", collapsed ? "px-2" : "px-4")}>        
        {!collapsed && (
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4Z" fill="url(#paint0_linear_sidebar)"/>
            <defs>
            <linearGradient id="paint0_linear_sidebar" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4F46E5"/>
            <stop offset="1" stopColor="#EC4899"/>
            </linearGradient>
            </defs>
          </svg>
        )}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden flex-1"
            >
              Dashboard
            </motion.span>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className={cn("h-8 hidden md:flex", collapsed ? "w-full justify-center" : "w-8 flex-shrink-0")}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Workspace Selector */}
      <div className="px-2 py-2">
        <WorkspaceSelector collapsed={collapsed} />
      </div>

      <Separator className="my-2" />

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150',
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                  collapsed && 'justify-center'
                )
              }
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("flex-shrink-0 h-5 w-5", !collapsed && "mr-3")} aria-hidden="true" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Settings Link */}
        <div className="px-2 pb-2">
          <NavLink
            to="/settings"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150',
                isActive
                  ? 'bg-primary/15 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                collapsed && 'justify-center'
              )
            }
            title={collapsed ? "Configuración" : undefined}
          >
            <Settings className={cn("h-5 w-5", !collapsed && "mr-3")} />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Configuración
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        </div>
      </div>

      <Separator />

      {/* User Section */}
      <div className="flex-shrink-0 px-2 py-2">
        {user && <UserNav user={user} onLogout={logout} collapsed={collapsed} />}
      </div>
    </div>
  );
}

export function Sidebar() {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? '80px' : '256px',
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-card border-r z-20"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>
    </>
  );
}

export function MobileMenuButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
