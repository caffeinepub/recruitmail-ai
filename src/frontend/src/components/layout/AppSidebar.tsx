import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils/format";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Send,
  Settings,
  Sun,
  User,
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/templates", icon: FileText, label: "Templates" },
  { to: "/send-email", icon: Send, label: "Send Email" },
  { to: "/smtp", icon: Settings, label: "SMTP Settings" },
  { to: "/resumes", icon: FileCheck, label: "Resumes" },
  { to: "/history", icon: Clock, label: "Email History" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  const isActive = (to: string) => {
    if (to === "/templates") {
      return (
        currentPath === "/templates" || currentPath.startsWith("/templates/")
      );
    }
    return currentPath === to;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-60",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-sidebar-border shrink-0",
            collapsed && "justify-center px-2",
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-display font-bold text-sm text-sidebar-foreground leading-tight">
                  RecruitMail
                </div>
                <div className="text-xs text-muted-foreground leading-tight">
                  AI
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <Link
                  to={to}
                  className={cn(
                    "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    isActive(to) &&
                      "bg-sidebar-accent text-sidebar-foreground font-semibold shadow-xs",
                    collapsed && "justify-center px-0 mx-2",
                  )}
                >
                  <Icon className="shrink-0" size={18} />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right" className="text-xs">
                  {label}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-sidebar-border p-2 space-y-1">
          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className={cn(
                  "w-full h-9 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                  collapsed
                    ? "px-0 justify-center"
                    : "justify-start px-3 gap-3",
                )}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {!collapsed && (
                  <span className="text-sm">
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </TooltipContent>
            )}
          </Tooltip>

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={cn(
                  "w-full h-9 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10",
                  collapsed
                    ? "px-0 justify-center"
                    : "justify-start px-3 gap-3",
                )}
              >
                <LogOut size={16} />
                {!collapsed && <span className="text-sm">Logout</span>}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="text-xs">
                Logout
              </TooltipContent>
            )}
          </Tooltip>

          {/* User info */}
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-sidebar-accent/50 mt-1">
              <Avatar className="w-7 h-7 text-xs">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn(
              "w-full h-9 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed ? "px-0 justify-center" : "justify-end px-3",
            )}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
