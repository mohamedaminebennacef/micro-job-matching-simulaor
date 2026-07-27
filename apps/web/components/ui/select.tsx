"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
});

function Select({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const [open, setOpen] = React.useState(false);
  const actualValue = value ?? internalValue;
  const handleChange = onValueChange ?? setInternalValue;

  return (
    <SelectContext.Provider value={{ value: actualValue, onValueChange: handleChange, open, setOpen }}>
      <div className={cn("relative", className)}>
        {children}
      </div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({
  children,
  className,
  ...props
}: React.ComponentProps<"button">) {
  const ctx = React.useContext(SelectContext);
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ctx.setOpen(false);
      }
    }
    if (ctx.open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ctx]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => ctx.setOpen(!ctx.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  const content = React.useContext(SelectContentContext);

  if (!ctx.value && placeholder) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  return <span>{content?.get(ctx.value) ?? ctx.value}</span>;
}

const SelectContentContext = React.createContext<{ get: (v: string) => React.ReactNode; set: (v: string, node: React.ReactNode) => void } | null>(null);

function SelectContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectContext);
  const [map] = React.useState(() => new Map<string, React.ReactNode>());

  React.useEffect(() => {
    map.clear();
  }, [map]);

  if (!ctx.open) return null;

  return (
    <SelectContentContext.Provider value={{ get: (v) => map.get(v), set: (v, node) => map.set(v, node) }}>
      <div
        className={cn(
          "absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </SelectContentContext.Provider>
  );
}

function SelectItem({
  value,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(SelectContext);
  const mapCtx = React.useContext(SelectContentContext);

  React.useEffect(() => {
    if (mapCtx) mapCtx.set(value, children);
  });

  return (
    <div
      role="option"
      aria-selected={ctx.value === value}
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        ctx.value === value && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {ctx.value === value && (
        <svg className="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
