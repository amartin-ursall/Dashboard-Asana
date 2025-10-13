import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, UserProfile } from '@/stores/auth.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useAsanaWorkspaces } from '@/hooks/useAsanaApi';
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
const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
};
function WorkspaceSelector() {
  const { data: workspaceData, isLoading } = useAsanaWorkspaces();
  const { workspaces, selectedWorkspaceGid, setWorkspaces, setSelectedWorkspaceGid } = useWorkspaceStore(
    (state) => ({
      workspaces: state.workspaces,
      selectedWorkspaceGid: state.selectedWorkspaceGid,
      setWorkspaces: state.setWorkspaces,
      setSelectedWorkspaceGid: state.setSelectedWorkspaceGid,
    })
  );
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
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <h1 className="text-xl font-semibold">{pageTitle}</h1>
      <div className="ml-auto flex items-center gap-4">
        <WorkspaceSelector />
        {user && <UserNav user={user} onLogout={logout} />}
      </div>
    </header>
  );
}