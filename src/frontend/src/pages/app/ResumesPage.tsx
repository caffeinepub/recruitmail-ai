import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateResume,
  useDeleteResume,
  useMarkDefaultResume,
  useResumes,
} from "@/hooks/useQueries";
import { formatDateShort } from "@/utils/format";
import { FileText, Loader2, Plus, Star, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ResumesPage() {
  const { data: resumes = [], isLoading } = useResumes();
  const createResume = useCreateResume();
  const deleteResume = useDeleteResume();
  const markDefault = useMarkDefaultResume();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [nameError, setNameError] = useState("");

  const handleUpload = async () => {
    if (!resumeName.trim()) {
      setNameError("Resume name is required");
      return;
    }
    setNameError("");
    try {
      await createResume.mutateAsync({
        name: resumeName.trim(),
        isDefault: resumes.length === 0,
      });
      toast.success("Resume uploaded successfully");
      setUploadOpen(false);
      setResumeName("");
    } catch {
      toast.error("Failed to upload resume");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteResume.mutateAsync(deleteId);
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setDeleteId(null);
    }
  };

  const handleMarkDefault = async (id: bigint) => {
    try {
      await markDefault.mutateAsync(id);
      toast.success("Default resume updated");
    } catch {
      toast.error("Failed to update default resume");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Resumes"
        description="Manage your resumes for email attachments"
        actions={
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload size={14} className="mr-1.5" /> Upload Resume
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["r1", "r2", "r3"].map((k) => (
            <Skeleton key={k} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="No resumes uploaded illustration"
              role="img"
            >
              <rect
                x="12"
                y="8"
                width="32"
                height="40"
                rx="4"
                className="fill-muted-foreground/20"
              />
              <rect
                x="18"
                y="18"
                width="20"
                height="2"
                rx="1"
                className="fill-muted-foreground/40"
              />
              <rect
                x="18"
                y="23"
                width="16"
                height="2"
                rx="1"
                className="fill-muted-foreground/40"
              />
              <rect
                x="18"
                y="28"
                width="18"
                height="2"
                rx="1"
                className="fill-muted-foreground/40"
              />
              <circle cx="44" cy="44" r="10" className="fill-primary/20" />
              <path
                d="M44 40v8M40 44h8"
                stroke="oklch(0.48 0.22 265)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
          title="No resumes uploaded"
          description="Upload your resume(s) to attach them to emails automatically."
          action={
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus size={14} className="mr-1.5" /> Upload Resume
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((r) => (
            <Card
              key={String(r.id)}
              className={`shadow-card hover:shadow-card-hover transition-shadow duration-200 ${r.isDefault ? "ring-2 ring-primary/40" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  {r.isDefault && (
                    <Badge
                      className="text-xs bg-primary/15 text-primary border-primary/30 gap-1"
                      variant="outline"
                    >
                      <Star size={10} fill="currentColor" /> Default
                    </Badge>
                  )}
                </div>

                <h3
                  className="font-semibold text-sm text-foreground mb-1 truncate"
                  title={r.name}
                >
                  {r.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Uploaded {formatDateShort(r.uploadedAt)}
                </p>

                <div className="flex items-center gap-2">
                  {!r.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs gap-1.5"
                      onClick={() => handleMarkDefault(r.id)}
                      disabled={markDefault.isPending}
                    >
                      {markDefault.isPending ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Star size={10} />
                      )}
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 h-7 text-xs gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                    onClick={() => setDeleteId(r.id)}
                  >
                    <Trash2 size={10} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rname">Resume Name</Label>
              <Input
                id="rname"
                placeholder="e.g. Software Engineer Resume v2"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpload()}
              />
              {nameError && (
                <p className="text-xs text-destructive">{nameError}</p>
              )}
            </div>

            {/* Drag & Drop UI */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Drop your resume here
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOC, DOCX up to 5MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={createResume.isPending}>
              {createResume.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Resume?"
        description="This will permanently delete this resume. Any templates using it will need a new attachment."
        onConfirm={handleDelete}
        loading={deleteResume.isPending}
      />
    </div>
  );
}
