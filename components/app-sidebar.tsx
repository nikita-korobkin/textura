import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="h-13 pl-4">
        <Logo variant="nav" />
      </SidebarHeader>

      <SidebarContent />
    </Sidebar>
  );
}
