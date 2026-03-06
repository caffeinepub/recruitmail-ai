import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type EmailHistory,
  EmailStatus,
  useDeleteEmailHistory,
  useEmailHistory,
  useEmailTemplates,
  useResendEmail,
} from "@/hooks/useQueries";
import { downloadCSV, formatDate } from "@/utils/format";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Clock,
  Download,
  Eye,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SortKey = "sentAt" | "recruiterName" | "company" | "status";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 10;

function SortIcon({
  k,
  sortKey,
  sortDir,
}: { k: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (k !== sortKey)
    return <ChevronsUpDown size={12} className="text-muted-foreground/50" />;
  return sortDir === "asc" ? (
    <ChevronUp size={12} />
  ) : (
    <ChevronDown size={12} />
  );
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  return (
    <th className="text-left px-4 py-2.5 select-none">
      <button
        type="button"
        className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        onClick={() => onSort(sortKey)}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && onSort(sortKey)
        }
      >
        {label}
        <SortIcon k={sortKey} sortKey={currentKey} sortDir={currentDir} />
      </button>
    </th>
  );
}

export function HistoryPage() {
  const { data: history = [], isLoading } = useEmailHistory();
  const { data: templates = [] } = useEmailTemplates();
  const deleteHistory = useDeleteEmailHistory();
  const resendEmail = useResendEmail();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("sentAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [previewEmail, setPreviewEmail] = useState<EmailHistory | null>(null);

  const templateName = (id: bigint) =>
    templates.find((t) => t.id === id)?.name ?? `Template #${String(id)}`;

  const filtered = history
    .filter((h) => {
      const matchSearch =
        !search ||
        h.recruiterName.toLowerCase().includes(search.toLowerCase()) ||
        h.company.toLowerCase().includes(search.toLowerCase()) ||
        h.recruiterEmail.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || h.status === statusFilter;
      const matchTemplate =
        templateFilter === "all" || String(h.templateId) === templateFilter;
      return matchSearch && matchStatus && matchTemplate;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "sentAt") cmp = Number(a.sentAt - b.sentAt);
      else if (sortKey === "recruiterName")
        cmp = a.recruiterName.localeCompare(b.recruiterName);
      else if (sortKey === "company") cmp = a.company.localeCompare(b.company);
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await deleteHistory.mutateAsync(deleteId);
      toast.success("Record deleted");
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleteId(null);
    }
  };

  const handleResend = async (id: bigint) => {
    try {
      await resendEmail.mutateAsync(id);
      toast.success("Email queued for resend");
    } catch {
      toast.error("Failed to resend email");
    }
  };

  const handleExport = () => {
    downloadCSV(
      filtered.map((h) => ({
        Recruiter: h.recruiterName,
        Company: h.company,
        Email: h.recruiterEmail,
        Template: templateName(h.templateId),
        Status: h.status,
        SentAt: formatDate(h.sentAt),
        Opened: h.openedAt ? formatDate(h.openedAt) : "—",
        Replied: h.repliedAt ? formatDate(h.repliedAt) : "—",
      })),
      "email-history-export.csv",
    );
  };

  return (
    <TooltipProvider>
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeader
          title="Email History"
          description="Track all sent emails, responses, and engagement"
          actions={
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download size={14} className="mr-1.5" /> Export CSV
            </Button>
          }
        />

        {/* Filters */}
        <Card className="shadow-card mb-4">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input
                  placeholder="Search recruiter, company, email..."
                  className="pl-8 h-8 text-xs"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EmailStatus.sent}>Sent</SelectItem>
                  <SelectItem value={EmailStatus.failed}>Failed</SelectItem>
                  <SelectItem value={EmailStatus.pending}>Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={templateFilter}
                onValueChange={(v) => {
                  setTemplateFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 text-xs w-40">
                  <SelectValue placeholder="Template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(search ||
                statusFilter !== "all" ||
                templateFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                    setTemplateFilter("all");
                    setPage(1);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card">
          {isLoading ? (
            <CardContent className="p-4 space-y-3">
              {["h1", "h2", "h3", "h4", "h5", "h6"].map((k) => (
                <Skeleton key={k} className="h-12 w-full" />
              ))}
            </CardContent>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={<Clock size={44} />}
              title="No email records found"
              description={
                search || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Your sent emails will appear here."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <SortableHeader
                        label="Recruiter"
                        sortKey="recruiterName"
                        currentKey={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        label="Company"
                        sortKey="company"
                        currentKey={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">
                        Email
                      </th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                        Template
                      </th>
                      <SortableHeader
                        label="Status"
                        sortKey="status"
                        currentKey={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="text-left px-4 py-2.5 hidden xl:table-cell text-xs font-medium text-muted-foreground">
                        Opened
                      </th>
                      <th className="text-left px-4 py-2.5 hidden xl:table-cell text-xs font-medium text-muted-foreground">
                        Replied
                      </th>
                      <SortableHeader
                        label="Sent"
                        sortKey="sentAt"
                        currentKey={sortKey}
                        currentDir={sortDir}
                        onSort={handleSort}
                      />
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((h, i) => (
                      <tr
                        key={String(h.id)}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        <td className="px-4 py-3 font-medium text-xs">
                          {h.recruiterName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {h.company}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell truncate max-w-[160px]">
                          {h.recruiterEmail}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs">
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {templateName(h.templateId)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={h.status} />
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {h.openedAt ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-success border-success/30 bg-success/10"
                            >
                              Yes
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap">
                          {h.repliedAt ? (
                            <Badge
                              variant="outline"
                              className="text-xs text-success border-success/30 bg-success/10"
                            >
                              Yes
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap hidden md:table-cell">
                          {formatDate(h.sentAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => setPreviewEmail(h)}
                                >
                                  <Eye size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                View preview
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary hover:text-primary"
                                  onClick={() => handleResend(h.id)}
                                  disabled={resendEmail.isPending}
                                >
                                  <RefreshCw size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                Resend
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteId(h.id)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">
                                Delete
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""}{" "}
                  found
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Email Preview Modal */}
        <Dialog
          open={!!previewEmail}
          onOpenChange={(o) => {
            if (!o) setPreviewEmail(null);
          }}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
            </DialogHeader>
            {previewEmail && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">To: </span>
                    <span className="font-medium">
                      {previewEmail.recruiterName} &lt;
                      {previewEmail.recruiterEmail}&gt;
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company: </span>
                    <span className="font-medium">{previewEmail.company}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status: </span>
                    <StatusBadge status={previewEmail.status} />
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sent: </span>
                    <span className="font-medium">
                      {formatDate(previewEmail.sentAt)}
                    </span>
                  </div>
                </div>
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/40 px-4 py-3 border-b border-border">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      Subject:
                    </div>
                    <div className="text-sm font-medium">
                      {previewEmail.subject}
                    </div>
                  </div>
                  <div className="p-4 text-sm text-foreground leading-relaxed min-h-[120px] whitespace-pre-wrap">
                    {templates
                      .find((t) => t.id === previewEmail.templateId)
                      ?.body.replace(/<[^>]*>/g, "") ??
                      "Template content not available."}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(o) => {
            if (!o) setDeleteId(null);
          }}
          title="Delete Email Record?"
          description="This will permanently remove this email from your history."
          onConfirm={handleDelete}
          loading={deleteHistory.isPending}
        />
      </div>
    </TooltipProvider>
  );
}
