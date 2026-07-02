import Link from 'next/link';
import { Logo } from '@/components/logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu className="flex-row items-center">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/" aria-label="Home">
                  <Logo variant="nav" />
                </Link>
              }
              className="h-9 hover:bg-transparent active:bg-transparent"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent />
    </Sidebar>
  );
}
