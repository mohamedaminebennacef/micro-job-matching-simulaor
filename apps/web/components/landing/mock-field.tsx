export function MockField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-xs text-slate-800 truncate mt-0.5">{value}</div>
    </div>
  );
}
