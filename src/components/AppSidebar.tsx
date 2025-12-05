import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, LogOut, ChevronLeft, Kanban, UserSearch, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'CRM Kanban', url: '/kanban', icon: Kanban },
  { title: 'Vendas', url: '/vendas', icon: ShoppingCart },
  { title: 'Produtos', url: '/products', icon: Package },
  { title: 'Resgate', url: '/resgate', icon: UserSearch },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="GetMore" 
            className={cn('object-contain shrink-0 transition-all', collapsed ? 'w-8 h-8' : 'w-12 h-12')}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <button
                key={item.title}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200',
                  collapsed ? 'justify-center p-3' : 'px-3 py-2.5',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'
                )}
                onClick={() => navigate(item.url)}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="font-medium text-sm">
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
        >
          <ChevronLeft className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Recolher</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}