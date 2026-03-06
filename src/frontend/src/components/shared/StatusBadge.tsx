import { Badge } from "@/components/ui/badge";
import { EmailStatus } from "@/hooks/useQueries";
import { cn } from "@/lib/utils";

interface Props {
  status: EmailStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: Props) {
  const config = {
    [EmailStatus.sent]: {
      label: "Sent",
      className: "bg-success/15 text-success border-success/30",
    },
    [EmailStatus.failed]: {
      label: "Failed",
      className: "bg-destructive/15 text-destructive border-destructive/30",
    },
    [EmailStatus.pending]: {
      label: "Pending",
      className: "bg-warning/15 text-warning border-warning/30",
    },
  };

  const cfg = config[status as EmailStatus] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium capitalize", cfg.className, className)}
    >
      {cfg.label}
    </Badge>
  );
}
