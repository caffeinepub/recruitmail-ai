import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateTemplate,
  useDeleteTemplate,
  useEmailTemplates,
} from "@/hooks/useQueries";
import { formatDateShort } from "@/utils/format";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Edit2,
  FileText,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TemplatesPage() {
  const { data: templates = [], isLoading } = useEmailTemplates();
  const deleteTemplate = useDeleteTemplate();
  const createTemplate = useCreateTemplate();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<bigint | null>(null);

  const filtered = templates.filter(
    (t) =>
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteTemplate.mutateAsync(deleteId);
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setDeleteId(null);
    }
  };

  const handleDuplicate = async (t: (typeof templates)[0]) => {
    try {
      await createTemplate.mutateAsync({
        name: `${t.name} (Copy)`,
        subject: t.subject,
        body: t.body,
        variables: t.variables,
      });
      toast.success("Template duplicated");
    } catch {
      toast.error("Failed to duplicate");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Email Templates"
        description="Create and manage your reusable email templates"
        actions={
          <Button onClick={() => navigate({ to: "/templates/new" })} size="sm">
            <Plus size={14} className="mr-1.5" /> New Template
          </Button>
        }
      />

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search templates..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["t1", "t2", "t3", "t4", "t5", "t6"].map((k) => (
            <Skeleton key={k} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={44} />}
          title={search ? "No templates found" : "No templates yet"}
          description={
            search
              ? "Try a different search term."
              : "Create your first email template to get started."
          }
          action={
            !search ? (
              <Button
                size="sm"
                onClick={() => navigate({ to: "/templates/new" })}
              >
                <Plus size={14} className="mr-1.5" /> Create Template
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <Card
              key={String(t.id)}
              className="group shadow-card hover:shadow-card-hover transition-shadow duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="text-primary" size={18} />
                  </div>
                  <div className="flex items-center gap-1">
                    {t.isActive ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-success/10 text-success border-success/30 gap-1"
                      >
                        <CheckCircle2 size={10} /> Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-muted text-muted-foreground gap-1"
                      >
                        <XCircle size={10} /> Draft
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            navigate({
                              to: "/templates/$id/edit",
                              params: { id: String(t.id) },
                            })
                          }
                        >
                          <Edit2 size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(t)}>
                          <Copy size={14} className="mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(t.id)}
                        >
                          <Trash2 size={14} className="mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <h3 className="font-semibold text-sm text-foreground mb-1 truncate">
                  {t.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate mb-3">
                  {t.subject}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Modified {formatDateShort(t.updatedAt)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs px-2 text-primary hover:text-primary"
                    onClick={() =>
                      navigate({
                        to: "/templates/$id/edit",
                        params: { id: String(t.id) },
                      })
                    }
                  >
                    <Edit2 size={11} className="mr-1" /> Edit
                  </Button>
                </div>

                {t.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.variables.slice(0, 3).map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="text-xs py-0 h-5"
                      >
                        {"{{"}
                        {v}
                        {"}}"}
                      </Badge>
                    ))}
                    {t.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs py-0 h-5">
                        +{t.variables.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Template?"
        description="This will permanently delete the template. This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteTemplate.isPending}
      />
    </div>
  );
}
