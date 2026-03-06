import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  EmailStatus,
  useEmailHistory,
  useEmailTemplates,
  useSeedData,
} from "@/hooks/useQueries";
import { downloadCSV, formatDate } from "@/utils/format";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MailOpen,
  Search,
  Send,
  Settings,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ITEMS_PER_PAGE = 8;

export function DashboardPage() {
  const { data: history = [], isLoading: historyLoading } = useEmailHistory();
  const { data: templates = [] } = useEmailTemplates();
  const seedMutation = useSeedData();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { mutate: seedMutate, isPending: seedPending } = seedMutation;
  // Seed data on first load if empty
  useEffect(() => {
    if (!historyLoading && history.length === 0 && !seedPending) {
      seedMutate();
    }
  }, [historyLoading, history.length, seedPending, seedMutate]);

  const totalSent = history.filter((h) => h.status === EmailStatus.sent).length;
  const totalFailed = history.filter(
    (h) => h.status === EmailStatus.failed,
  ).length;
  const totalPending = history.filter(
    (h) => h.status === EmailStatus.pending,
  ).length;

  const today = new Date().toDateString();
  const sentToday = history.filter((h) => {
    const d = new Date(Number(BigInt(h.sentAt) / 1_000_000n));
    return d.toDateString() === today && h.status === EmailStatus.sent;
  }).length;

  // Chart data
  const chartData = [
    { name: "Sent", value: totalSent },
    { name: "Failed", value: totalFailed },
    { name: "Pending", value: totalPending },
  ];

  // Bar chart: last 7 days
  const barData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const sent = history.filter((h) => {
      const hd = new Date(Number(BigInt(h.sentAt) / 1_000_000n));
      return (
        hd.toDateString() === d.toDateString() && h.status === EmailStatus.sent
      );
    }).length;
    const failed = history.filter((h) => {
      const hd = new Date(Number(BigInt(h.sentAt) / 1_000_000n));
      return (
        hd.toDateString() === d.toDateString() &&
        h.status === EmailStatus.failed
      );
    }).length;
    return { name: label, Sent: sent, Failed: failed };
  });

  // Filtered table
  const filtered = history.filter((h) => {
    const matchSearch =
      !search ||
      h.recruiterName.toLowerCase().includes(search.toLowerCase()) ||
      h.company.toLowerCase().includes(search.toLowerCase()) ||
      h.recruiterEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const templateName = (id: bigint) =>
    templates.find((t) => t.id === id)?.name ?? `Template #${id}`;

  const handleExport = () => {
    downloadCSV(
      filtered.map((h) => ({
        Recruiter: h.recruiterName,
        Company: h.company,
        Email: h.recruiterEmail,
        Template: templateName(h.templateId),
        Status: h.status,
        SentAt: formatDate(h.sentAt),
      })),
      "email-history.csv",
    );
  };

  const PIE_COLORS = ["#6366f1", "#ef4444", "#f59e0b"];

  const statCards = [
    {
      label: "Total Emails Sent",
      value: totalSent,
      icon: MailOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Sent Today",
      value: sentToday,
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Successful",
      value: totalSent,
      icon: CheckCircle2,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Failed",
      value: totalFailed,
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Overview of your email activity and performance"
        actions={
          <div className="flex gap-2">
            <Button onClick={() => navigate({ to: "/send-email" })} size="sm">
              <Send size={14} className="mr-1.5" /> Send Email
            </Button>
            <Button
              onClick={() => navigate({ to: "/templates/new" })}
              variant="outline"
              size="sm"
            >
              <FileText size={14} className="mr-1.5" /> New Template
            </Button>
            <Button
              onClick={() => navigate({ to: "/smtp" })}
              variant="outline"
              size="sm"
            >
              <Settings size={14} className="mr-1.5" /> SMTP
            </Button>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              {historyLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {s.label}
                    </p>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}
                  >
                    <s.icon className={`${s.color}`} size={18} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Email Activity (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={barData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="Sent"
                    fill="oklch(0.52 0.23 265)"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="Failed"
                    fill="oklch(0.58 0.22 28)"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {chartData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold">
              Recent Email Activity
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <Input
                  placeholder="Search..."
                  className="pl-8 h-8 text-xs w-48"
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
                <SelectTrigger className="h-8 text-xs w-28">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={EmailStatus.sent}>Sent</SelectItem>
                  <SelectItem value={EmailStatus.failed}>Failed</SelectItem>
                  <SelectItem value={EmailStatus.pending}>Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs gap-1.5"
                onClick={handleExport}
              >
                <Download size={12} /> CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {historyLoading ? (
            <div className="p-4 space-y-3">
              {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                <Skeleton key={k} className="h-10 w-full" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={<Clock size={40} />}
              title="No email activity yet"
              description="Send your first email to see activity here."
              action={
                <Button
                  size="sm"
                  onClick={() => navigate({ to: "/send-email" })}
                >
                  Send Email
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                        Recruiter
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                        Company
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 hidden lg:table-cell">
                        Template
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2.5 hidden md:table-cell">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((h, i) => (
                      <tr
                        key={String(h.id)}
                        className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}
                      >
                        <td className="px-4 py-3 font-medium text-foreground text-xs">
                          {h.recruiterName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {h.company}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell truncate max-w-[180px]">
                          {h.recruiterEmail}
                        </td>
                        <td className="px-4 py-3 text-xs hidden lg:table-cell">
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
                        <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell whitespace-nowrap">
                          {formatDate(h.sentAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–
                  {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
                  {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <Button
                        key={p}
                        size="icon"
                        variant={p === page ? "default" : "ghost"}
                        className="h-7 w-7 text-xs"
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </Button>
                    );
                  })}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
