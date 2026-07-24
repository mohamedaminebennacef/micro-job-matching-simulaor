"use client";

import { useEffect, useState } from "react";

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onCancel}
      />
      <div
        className={`relative mx-4 w-full max-w-sm rounded-xl bg-card p-6 shadow-xl transition-all ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
