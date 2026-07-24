export function LogoStrip() {
  const unis = [
    "Sorbonne",
    "TU Delft",
    "ETH Zürich",
    "KU Leuven",
    "UCL",
    "Uppsala",
  ];

  return (
    <section className="border-y border-slate-100 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-slate-400 mb-6">
          Piloted at university campuses across Europe
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-slate-500">
          {unis.map((u) => (
            <span
              key={u}
              className="font-semibold tracking-tight text-lg opacity-70 hover:opacity-100 transition"
            >
              {u}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
