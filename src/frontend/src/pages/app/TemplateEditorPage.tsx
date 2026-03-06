import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateTemplate,
  useEmailTemplates,
  useUpdateTemplate,
} from "@/hooks/useQueries";
import { extractVariables } from "@/utils/format";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bold,
  ChevronDown,
  Italic,
  List,
  Loader2,
  Underline,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const VARIABLES = [
  { label: "Recruiter Name", value: "{{recruiter_name}}" },
  { label: "Company Name", value: "{{company_name}}" },
  { label: "Job Title", value: "{{job_title}}" },
  { label: "Your Name", value: "{{your_name}}" },
  { label: "Your Email", value: "{{your_email}}" },
];

function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = (cmd: string) => {
    document.execCommand(cmd, false, undefined);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && editorRef.current && value) {
      editorRef.current.innerHTML = value;
      initialized.current = true;
    }
  }, [value]);

  const insertVariable = (v: string) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, v);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-0.5 p-2 border-b border-border bg-muted/30 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => exec("bold")}
        >
          <Bold size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => exec("italic")}
        >
          <Italic size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => exec("underline")}
        >
          <Underline size={14} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => exec("insertUnorderedList")}
        >
          <List size={14} />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
            >
              Insert Variable <ChevronDown size={12} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {VARIABLES.map((v) => (
              <DropdownMenuItem
                key={v.value}
                onClick={() => insertVariable(v.value)}
              >
                <code className="text-xs mr-2 text-primary">{v.value}</code>{" "}
                {v.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="min-h-[200px] p-3 text-sm focus:outline-none text-foreground"
        style={{ lineHeight: "1.7" }}
      />
    </div>
  );
}

function PreviewPane({ html }: { html: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (divRef.current) {
      divRef.current.textContent = "";
      if (html) {
        const template = document.createElement("template");
        template.innerHTML = html;
        divRef.current.appendChild(template.content.cloneNode(true));
      }
    }
  }, [html]);
  return (
    <div
      ref={divRef}
      className="p-4 text-sm text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert min-h-[200px]"
    >
      {!html && (
        <p className="text-muted-foreground italic">
          Start typing to see preview...
        </p>
      )}
    </div>
  );
}

export function TemplateEditorPage() {
  const params = useParams({ strict: false });
  const id = (params as { id?: string }).id;
  const isEdit = !!id;
  const { data: templates = [] } = useEmailTemplates();
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const navigate = useNavigate();

  const existing = isEdit ? templates.find((t) => String(t.id) === id) : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [subject, setSubject] = useState(existing?.subject ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [activate, setActivate] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSubject(existing.subject);
      setBody(existing.body);
    }
  }, [existing]);

  const variables = extractVariables(`${subject} ${body}`);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Template name is required";
    if (!subject.trim()) e.subject = "Subject is required";
    if (!body.trim()) e.body = "Body is required";
    return e;
  };

  const handleSave = async (isActivate: boolean) => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setActivate(isActivate);

    try {
      if (isEdit && existing) {
        await updateTemplate.mutateAsync({
          id: existing.id,
          subject,
          body,
          variables,
        });
        toast.success("Template updated");
      } else {
        await createTemplate.mutateAsync({ name, subject, body, variables });
        toast.success(
          isActivate
            ? "Template created and activated"
            : "Template saved as draft",
        );
      }
      navigate({ to: "/templates" });
    } catch {
      toast.error("Failed to save template");
    }
  };

  const previewHtml = body
    .replace(/\{\{recruiter_name\}\}/g, "<strong>Sarah Chen</strong>")
    .replace(/\{\{company_name\}\}/g, "<strong>TechCorp Inc</strong>")
    .replace(/\{\{job_title\}\}/g, "<strong>Senior Engineer</strong>")
    .replace(/\{\{your_name\}\}/g, "<strong>Alex Johnson</strong>")
    .replace(/\{\{your_email\}\}/g, "<strong>alex@example.com</strong>");

  const isPending = createTemplate.isPending || updateTemplate.isPending;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title={isEdit ? "Edit Template" : "New Template"}
        description={
          isEdit
            ? "Update your email template"
            : "Create a reusable email template with dynamic variables"
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/templates" })}
          >
            <ArrowLeft size={14} className="mr-1.5" /> Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Template Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tname">Template Name</Label>
                <Input
                  id="tname"
                  placeholder="e.g. Software Engineer Outreach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isEdit}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Interested in {{job_title}} at {{company_name}}"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                {errors.subject && (
                  <p className="text-xs text-destructive">{errors.subject}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Email Body</Label>
                <RichTextEditor value={body} onChange={setBody} />
                {errors.body && (
                  <p className="text-xs text-destructive">{errors.body}</p>
                )}
              </div>

              {variables.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Detected variables:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((v) => (
                      <Badge key={v} variant="secondary" className="text-xs">
                        {"{{"}
                        {v}
                        {"}}"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleSave(false)}
              disabled={isPending}
            >
              {isPending && !activate && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Draft
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleSave(true)}
              disabled={isPending}
            >
              {isPending && activate && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Update Template" : "Save & Activate"}
            </Button>
          </div>
        </div>

        {/* Preview Panel */}
        <div>
          <Card className="shadow-card sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/40 px-4 py-3 border-b border-border">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Subject:
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {subject || (
                      <span className="text-muted-foreground/50 italic">
                        No subject yet
                      </span>
                    )}
                  </div>
                </div>
                <PreviewPane html={previewHtml} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Variables are shown with sample values for preview.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
