import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuthStore, UserProfile } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useUIStore } from '@/stores/ui.store';
import { useAsanaWorkspaces } from '@/hooks/useAsanaApi';
import { ChevronRight, PanelLeftClose, PanelLeft } from 'lucide-react';
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
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, Building, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LogoutConfirmationDialog } from './LogoutConfirmationDialog';
const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Dashboard';
  const pathParts = pathname.substring(1).split('/');
  const title = pathParts[0].charAt(0).toUpperCase() + pathParts[0].substring(1);
  if (title === 'Projects' && pathParts.length > 1) {
    return 'Project Detail';
  }
  return title;
};

const getBreadcrumbs = (pathname: string): Array<{ label: string; href: string }> => {
  if (pathname === '/') return [{ label: 'Dashboard', href: '/' }];

  const pathParts = pathname.substring(1).split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Dashboard', href: '/' }];

  pathParts.forEach((part, index) => {
    const label = part.charAt(0).toUpperCase() + part.substring(1);
    const href = '/' + pathParts.slice(0, index + 1).join('/');
    breadcrumbs.push({ label, href });
  });

  return breadcrumbs;
};
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};
function WorkspaceSelector() {
  const { data: workspaceData, isLoading } = useAsanaWorkspaces();

  // FIX: Use individual selectors to avoid getSnapshot caching issues
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const selectedWorkspaceGid = useWorkspaceStore((state) => state.selectedWorkspaceGid);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setSelectedWorkspaceGid = useWorkspaceStore((state) => state.setSelectedWorkspaceGid);
  useEffect(() => {
    if (workspaceData?.data) {
      setWorkspaces(workspaceData.data);
    }
  }, [workspaceData, setWorkspaces]);
  if (isLoading) {
    return <Skeleton className="h-9 w-48" />;
  }
  if (!workspaces || workspaces.length === 0) {
    return null;
  }
  return (
    <Select value={selectedWorkspaceGid || ''} onValueChange={setSelectedWorkspaceGid}>
      <SelectTrigger className="w-[180px] h-9">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select workspace" />
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
function UserNav({ user, onLogout }: { user: UserProfile; onLogout: () => void }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  return (
    <>
      <LogoutConfirmationDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={onLogout}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
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
              <span>Go to Asana</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsLogoutDialogOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
export function Header() {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed);
  const toggleSidebar = useUIStore(s => s.toggleSidebar);

  // Import mobile menu dynamically to avoid circular dependencies
  const MobileMenu = React.lazy(() => import('./Sidebar').then(m => ({ default: m.MobileMenuButton })));

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex h-16 items-center gap-4">
        {/* Mobile Menu */}
        <React.Suspense fallback={null}>
          <MobileMenu />
        </React.Suspense>

        {/* Desktop Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hidden md:flex"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>

        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-xl font-semibold truncate">{pageTitle}</h1>
          {breadcrumbs.length > 1 && (
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <ChevronRight className="h-3 w-3" />}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="font-medium text-foreground truncate">{crumb.label}</span>
                  ) : (
                    <Link
                      to={crumb.href}
                      className="hover:text-foreground transition-colors truncate"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <WorkspaceSelector />
          {user && <UserNav user={user} onLogout={logout} />}
        </div>
      </div>
    </header>
  );
}