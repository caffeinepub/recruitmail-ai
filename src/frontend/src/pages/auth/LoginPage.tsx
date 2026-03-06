import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-primary p-12 text-primary-foreground">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight">
                RecruitMail AI
              </div>
              <div className="text-xs opacity-70">
                Automated Recruiter Outreach
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-display font-bold leading-tight mb-4">
            Land your dream job, one email at a time.
          </h2>
          <p className="opacity-80 text-sm leading-relaxed">
            Automate personalized recruiter emails, track responses, and manage
            your job search like a pro.
          </p>
        </div>
        <div className="space-y-3">
          {["Smart Templates", "SMTP Integration", "Response Tracking"].map(
            (f) => (
              <div
                key={f}
                className="flex items-center gap-2 text-sm opacity-90"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                {f}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your RecruitMail account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                  onClick={() => setShowPw((p) => !p)}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
