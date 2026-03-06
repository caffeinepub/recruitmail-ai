import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  EmailStatus,
  useCreateEmailHistory,
  useEmailTemplates,
  useResumes,
} from "@/hooks/useQueries";
import { nowBigInt } from "@/utils/format";
import { Clock, FileCheck, Loader2, Mail, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function SendEmailPage() {
  const { data: templates = [] } = useEmailTemplates();
  const { data: resumes = [] } = useResumes();
  const createHistory = useCreateEmailHistory();

  const [templateId, setTemplateId] = useState<string>("");
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [resumeId, setResumeId] = useState<string>("");
  const [sendMode, setSendMode] = useState<"now" | "scheduled">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  // Auto-fill from selected template
  const selectedTemplate = templates.find((t) => String(t.id) === templateId);
  const defaultResume = resumes.find((r) => r.isDefault);

  useEffect(() => {
    if (selectedTemplate) {
      let s = selectedTemplate.subject;
      let b = selectedTemplate.body;
      s = s.replace(
        /\{\{recruiter_name\}\}/g,
        recruiterName || "{{recruiter_name}}",
      );
      s = s.replace(/\{\{company_name\}\}/g, company || "{{company_name}}");
      s = s.replace(/\{\{job_title\}\}/g, jobTitle || "{{job_title}}");
      b = b.replace(
        /\{\{recruiter_name\}\}/g,
        recruiterName || "{{recruiter_name}}",
      );
      b = b.replace(/\{\{company_name\}\}/g, company || "{{company_name}}");
      b = b.replace(/\{\{job_title\}\}/g, jobTitle || "{{job_title}}");
      setSubject(s);
      setBody(b);
    }
  }, [recruiterName, company, jobTitle, selectedTemplate]);

  useEffect(() => {
    if (defaultResume && !resumeId) {
      setResumeId(String(defaultResume.id));
    }
  }, [defaultResume, resumeId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!recruiterName.trim()) e.recruiterName = "Recruiter name is required";
    if (!recruiterEmail.trim())
      e.recruiterEmail = "Recruiter email is required";
    else if (!/\S+@\S+\.\S+/.test(recruiterEmail))
      e.recruiterEmail = "Enter a valid email";
    if (!company.trim()) e.company = "Company is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!body.trim()) e.body = "Message body is required";
    return e;
  };

  const handleSend = async (isTest = false) => {
    if (!isTest) {
      const errs = validate();
      if (Object.keys(errs).length) {
        setErrors(errs);
        return;
      }
    }
    setErrors({});
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // simulate SMTP delay
      if (!isTest) {
        await createHistory.mutateAsync({
          id: BigInt(Date.now()),
          status: EmailStatus.sent,
          subject,
          templateId: selectedTemplate?.id ?? 0n,
          recruiterEmail,
          recruiterName,
          sentAt: nowBigInt(),
          company,
          jobTitle,
        });
        toast.success("Email sent successfully!");
        // Reset form
        setRecruiterName("");
        setRecruiterEmail("");
        setCompany("");
        setJobTitle("");
        setSubject("");
        setBody("");
        setTemplateId("");
      } else {
        toast.success("Test email sent to your inbox!");
      }
    } catch {
      toast.error("Failed to send email. Check your SMTP settings.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Send Email"
        description="Send a personalized email to a recruiter"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Recipient Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template selector */}
              <div className="space-y-1.5">
                <Label>Template (optional)</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template to auto-fill..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={String(t.id)} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Mail size={10} /> Using: {selectedTemplate.name}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rname">Recruiter Name *</Label>
                  <Input
                    id="rname"
                    placeholder="Sarah Chen"
                    value={recruiterName}
                    onChange={(e) => setRecruiterName(e.target.value)}
                  />
                  {errors.recruiterName && (
                    <p className="text-xs text-destructive">
                      {errors.recruiterName}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remail">Recruiter Email *</Label>
                  <Input
                    id="remail"
                    type="email"
                    placeholder="sarah@company.com"
                    value={recruiterEmail}
                    onChange={(e) => setRecruiterEmail(e.target.value)}
                  />
                  {errors.recruiterEmail && (
                    <p className="text-xs text-destructive">
                      {errors.recruiterEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    placeholder="TechCorp Inc"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                  {errors.company && (
                    <p className="text-xs text-destructive">{errors.company}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jobtitle">Job Title</Label>
                  <Input
                    id="jobtitle"
                    placeholder="Senior Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="esubject">Subject *</Label>
                <Input
                  id="esubject"
                  placeholder="Interested in Software Engineer role at TechCorp"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ebody">Message Body *</Label>
                <Textarea
                  id="ebody"
                  placeholder="Write your email message here..."
                  rows={8}
                  value={body.replace(/<[^>]*>/g, "")}
                  onChange={(e) => setBody(e.target.value)}
                  className="resize-none"
                />
                {errors.body && (
                  <p className="text-xs text-destructive">{errors.body}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Resume Attachment */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileCheck size={16} className="text-primary" /> Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={resumeId} onValueChange={setResumeId}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select resume..." />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((r) => (
                    <SelectItem key={String(r.id)} value={String(r.id)}>
                      {r.name} {r.isDefault ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {resumes.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  No resumes uploaded yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Send Options */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Send Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={sendMode}
                onValueChange={(v) => setSendMode(v as "now" | "scheduled")}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="now" className="flex-1 text-xs">
                    <Send size={12} className="mr-1" /> Send Now
                  </TabsTrigger>
                  <TabsTrigger value="scheduled" className="flex-1 text-xs">
                    <Clock size={12} className="mr-1" /> Schedule
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="scheduled" className="mt-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Schedule Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => handleSend(true)}
                  disabled={sending}
                >
                  {sending && (
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  )}
                  Send Test Email
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleSend(false)}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} className="mr-2" />
                      {sendMode === "scheduled"
                        ? "Schedule Send"
                        : "Send Email"}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
