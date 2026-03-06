import { PageHeader } from "@/components/shared/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/format";
import { Eye, EyeOff, Loader2, Lock, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const handleSaveProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (Object.keys(e).length) {
      setProfileErrors(e);
      return;
    }
    setProfileErrors({});
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    updateProfile(name, email);
    toast.success("Profile updated successfully");
    setSavingProfile(false);
  };

  const handleChangePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = "Current password is required";
    if (!newPw) e.newPw = "New password is required";
    else if (newPw.length < 6)
      e.newPw = "Password must be at least 6 characters";
    if (newPw !== confirmPw) e.confirmPw = "Passwords don't match";
    if (Object.keys(e).length) {
      setPwErrors(e);
      return;
    }
    setPwErrors({});
    setSavingPw(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Password changed successfully");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setSavingPw(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="Profile Settings"
        description="Manage your account information"
      />

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16 text-xl">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold font-display">
            {user ? getInitials(user.name) : "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-foreground">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Profile Form */}
      <Card className="shadow-card mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User size={16} className="text-primary" /> Personal Information
          </CardTitle>
          <CardDescription className="text-xs">
            Update your name and email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="pname">Full Name</Label>
              <Input
                id="pname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
              />
              {profileErrors.name && (
                <p className="text-xs text-destructive">{profileErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pemail">Email Address</Label>
              <Input
                id="pemail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {profileErrors.email && (
                <p className="text-xs text-destructive">
                  {profileErrors.email}
                </p>
              )}
            </div>

            <Button type="submit" size="sm" disabled={savingProfile}>
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="mr-2" /> Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock size={16} className="text-primary" /> Change Password
          </CardTitle>
          <CardDescription className="text-xs">
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleChangePassword}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="cpw">Current Password</Label>
              <div className="relative">
                <Input
                  id="cpw"
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Your current password"
                  className="pr-10"
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
              {pwErrors.currentPw && (
                <p className="text-xs text-destructive">{pwErrors.currentPw}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="npw">New Password</Label>
              <Input
                id="npw"
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters"
              />
              {pwErrors.newPw && (
                <p className="text-xs text-destructive">{pwErrors.newPw}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmpw">Confirm New Password</Label>
              <Input
                id="confirmpw"
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
              {pwErrors.confirmPw && (
                <p className="text-xs text-destructive">{pwErrors.confirmPw}</p>
              )}
            </div>

            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={savingPw}
            >
              {savingPw ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Changing...
                </>
              ) : (
                <>
                  <Lock size={14} className="mr-2" /> Change Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer attribution */}
      <p className="text-center text-xs text-muted-foreground/60 mt-8">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </p>
    </div>
  );
}
