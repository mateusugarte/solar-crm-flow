import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Package, LogOut, ChevronLeft, Kanban, ArrowRight, UserSearch, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'CRM Kanban', url: '/kanban', icon: Kanban },
  { title: 'Vendas', url: '/vendas', icon: ShoppingCart },
  { title: 'Produtos', url: '/products', icon: Package },
  { title: 'Resgate', url: '/resgate', icon: UserSearch },
];

const ACCENT_COLOR = '#F59E0B'; // Yellow/amber color

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
        <div className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <motion.div
                key={item.title}
                className={cn(
                  'group flex items-center gap-3 cursor-pointer rounded-lg transition-colors',
                  collapsed ? 'justify-center p-3' : 'px-3 py-3'
                )}
                initial="initial"
                whileHover="hover"
                animate={isActive ? 'active' : 'initial'}
                onClick={() => navigate(item.url)}
              >
                {!collapsed && (
                  <motion.div
                    variants={{
                      initial: { x: '-100%', opacity: 0 },
                      hover: { x: 0, opacity: 1 },
                      active: { x: 0, opacity: 1 },
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="z-0"
                    style={{ color: ACCENT_COLOR }}
                  >
                    <ArrowRight strokeWidth={3} className="w-5 h-5" />
                  </motion.div>
                )}

                <motion.div
                  className="flex items-center gap-3"
                  variants={{
                    initial: { x: collapsed ? 0 : -20, color: 'inherit' },
                    hover: { x: 0, color: ACCENT_COLOR },
                    active: { x: 0, color: ACCENT_COLOR },
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <item.icon 
                    className={cn(
                      'w-5 h-5 shrink-0 transition-colors',
                      isActive ? 'text-amber-400' : 'text-sidebar-foreground group-hover:text-amber-400'
                    )} 
                  />
                  {!collapsed && (
                    <span 
                      className={cn(
                        'font-semibold text-lg transition-colors',
                        isActive ? 'text-amber-400' : 'text-sidebar-foreground group-hover:text-amber-400'
                      )}
                    >
                      {item.title}
                    </span>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-amber-400"
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