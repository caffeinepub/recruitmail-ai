import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (password !== confirm) e.confirm = "Passwords don't match";
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
      await signup(name, email, password);
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <Mail className="text-primary-foreground" size={18} />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            RecruitMail AI
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start automating your job search today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="name"
                placeholder="Alex Johnson"
                autoComplete="name"
                className="pl-9"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

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
                placeholder="Min. 6 characters"
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="confirm"
                type={showPw ? "text" : "password"}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="pl-9"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            {errors.confirm && (
              <p className="text-xs text-destructive">{errors.confirm}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
