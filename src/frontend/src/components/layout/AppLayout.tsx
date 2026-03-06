import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/format";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { Bell, Menu } from "lucide-react";
import { useState } from "react";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col shrink-0">
        <AppSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((p) => !p)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-60">
          <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-3 shrink-0 z-10">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex-1" />

          {/* Notification Bell */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
          </Button>

          {/* User Avatar */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate({ to: "/profile" })}
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {user ? getInitials(user.name) : "?"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
