import type { DocumentStatus } from "@/types/documents";

type StatusBadgeProps = {
  status: DocumentStatus;
};

const labelByStatus: Record<DocumentStatus, string> = {
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
  deleted: "Deleted",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-${status}`}>{labelByStatus[status]}</span>;
}
