"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import { LogoutButton } from "@/components/logout-button";
import { Separator } from "@countdown/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@countdown/ui/components/sidebar";
import { TooltipProvider } from "@countdown/ui/components/tooltip";

type AdminShellProps = {
  email: string;
  children: React.ReactNode;
};

export const AdminShell = ({ email, children }: AdminShellProps) => {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar email={email} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <div className="flex flex-1 items-center justify-end">
              <LogoutButton email={email} role="ADMIN" />
            </div>
          </header>
          <div className="flex flex-1 flex-col p-4 md:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};
