import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
// Auth pages
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";

// App pages
import { DashboardPage } from "./pages/app/DashboardPage";
import { HistoryPage } from "./pages/app/HistoryPage";
import { ProfilePage } from "./pages/app/ProfilePage";
import { ResumesPage } from "./pages/app/ResumesPage";
import { SendEmailPage } from "./pages/app/SendEmailPage";
import { SmtpPage } from "./pages/app/SmtpPage";
import { TemplateEditorPage } from "./pages/app/TemplateEditorPage";
import { TemplatesPage } from "./pages/app/TemplatesPage";

/* ─── Routes ──────────────────────────────────────────────── */

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignupPage,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
});

// Protected layout route
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const templatesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/templates",
  component: TemplatesPage,
});

const templateNewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/templates/new",
  component: TemplateEditorPage,
});

const templateEditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/templates/$id/edit",
  component: TemplateEditorPage,
});

const sendEmailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/send-email",
  component: SendEmailPage,
});

const smtpRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/smtp",
  component: SmtpPage,
});

const resumesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/resumes",
  component: ResumesPage,
});

const historyRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/history",
  component: HistoryPage,
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  signupRoute,
  forgotPasswordRoute,
  appLayoutRoute.addChildren([
    dashboardRoute,
    templatesRoute,
    templateNewRoute,
    templateEditRoute,
    sendEmailRoute,
    smtpRoute,
    resumesRoute,
    historyRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

/* ─── App Entry ───────────────────────────────────────────── */

function RouterApp() {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
