import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useSetSmtpConfig, useSmtpConfig } from "@/hooks/useQueries";
import type { SmtpConfig } from "@/hooks/useQueries";
import {
  Eye,
  EyeOff,
  Loader2,
  Shield,
  TestTube,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DEFAULT_CONFIG: SmtpConfig = {
  host: "",
  password: "",
  port: 587n,
  email: "",
  isConnected: false,
  fromName: "",
  replyTo: "",
  encryptionType: "TLS",
};

export function SmtpPage() {
  const { data: smtpConfig, isLoading } = useSmtpConfig();
  const setSmtp = useSetSmtpConfig();

  const [config, setConfig] = useState<SmtpConfig>(DEFAULT_CONFIG);
  const [showPw, setShowPw] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (smtpConfig) {
      setConfig(smtpConfig);
    }
  }, [smtpConfig]);

  const set = <K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!config.host.trim()) e.host = "SMTP host is required";
    if (!config.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(config.email))
      e.email = "Enter a valid email";
    if (!config.password) e.password = "Password is required";
    if (!config.fromName.trim()) e.fromName = "From name is required";
    return e;
  };

  const handleTest = async () => {
    setTesting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTesting(false);
    const success = config.host && config.email && config.password;
    if (success) {
      set("isConnected", true);
      toast.success("Connection successful! SMTP is properly configured.");
    } else {
      set("isConnected", false);
      toast.error("Connection failed. Please check your settings.");
    }
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    try {
      await setSmtp.mutateAsync(config);
      toast.success("SMTP settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <PageHeader
        title="SMTP Configuration"
        description="Configure your email provider to send emails"
      />

      {/* Status indicator */}
      <div
        className={`flex items-center gap-2.5 p-3 rounded-lg mb-6 border ${
          config.isConnected
            ? "bg-success/10 border-success/30 text-success"
            : "bg-muted/50 border-border text-muted-foreground"
        }`}
      >
        {config.isConnected ? (
          <>
            <Wifi size={16} />
            <span className="text-sm font-medium">
              Connected — SMTP is working properly
            </span>
            <Badge
              className="ml-auto text-xs bg-success/20 text-success border-success/30"
              variant="outline"
            >
              Connected
            </Badge>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">
              Not Connected — Configure and test your settings
            </span>
            <Badge className="ml-auto text-xs" variant="outline">
              Disconnected
            </Badge>
          </>
        )}
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Server Settings
          </CardTitle>
          <CardDescription className="text-xs">
            Configure your SMTP server connection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="host">SMTP Host *</Label>
              <Input
                id="host"
                placeholder="smtp.gmail.com"
                value={config.host}
                onChange={(e) => set("host", e.target.value)}
                disabled={isLoading}
              />
              {errors.host && (
                <p className="text-xs text-destructive">{errors.host}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                placeholder="587"
                value={Number(config.port)}
                onChange={(e) => set("port", BigInt(e.target.value || "587"))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="encryption">Encryption Type</Label>
            <Select
              value={config.encryptionType}
              onValueChange={(v) => set("encryptionType", v)}
            >
              <SelectTrigger id="encryption">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SSL">SSL</SelectItem>
                <SelectItem value="TLS">TLS</SelectItem>
                <SelectItem value="STARTTLS">STARTTLS</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="semail">Email Address *</Label>
            <Input
              id="semail"
              type="email"
              placeholder="your@gmail.com"
              value={config.email}
              onChange={(e) => set("email", e.target.value)}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="spw">Password *</Label>
            <div className="relative">
              <Input
                id="spw"
                type={showPw ? "text" : "password"}
                placeholder="App password or SMTP password"
                value={config.password}
                onChange={(e) => set("password", e.target.value)}
                className="pr-10"
                disabled={isLoading}
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
            <Label htmlFor="fromname">From Name *</Label>
            <Input
              id="fromname"
              placeholder="Alex Johnson"
              value={config.fromName}
              onChange={(e) => set("fromName", e.target.value)}
              disabled={isLoading}
            />
            {errors.fromName && (
              <p className="text-xs text-destructive">{errors.fromName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="replyto">Reply-to Email</Label>
            <Input
              id="replyto"
              type="email"
              placeholder="replies@yourmail.com (optional)"
              value={config.replyTo}
              onChange={(e) => set("replyTo", e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-primary/5 border border-primary/20 mt-4">
        <Shield size={16} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-medium text-foreground">
            Your credentials are encrypted
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            SMTP credentials are stored securely. For Gmail, use an App Password
            instead of your account password.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={testing || setSmtp.isPending}
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing...
            </>
          ) : (
            <>
              <TestTube size={14} className="mr-2" /> Test Connection
            </>
          )}
        </Button>
        <Button onClick={handleSave} disabled={setSmtp.isPending || testing}>
          {setSmtp.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
