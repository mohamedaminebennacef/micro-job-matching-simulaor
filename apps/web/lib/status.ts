import type { GigStatus } from "@/lib/api";

export const STATUS_TONES: Record<GigStatus, string> = {
  Open: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Assigned: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  InProgress: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  PendingConfirmation: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
};

export const STATUS_LABELS: Record<GigStatus, string> = {
  Open: "Open",
  Assigned: "Assigned",
  InProgress: "In Progress",
  PendingConfirmation: "Pending Confirmation",
  Completed: "Completed",
};

export function statusLabel(status: GigStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function statusTone(status: GigStatus): string {
  return STATUS_TONES[status] ?? STATUS_TONES.Open;
}
