export function BackgroundShapes() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute -top-40 -left-32 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-indigo-200/60 via-sky-200/40 to-transparent blur-3xl" />
      <div className="absolute top-[30%] -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-violet-200/50 via-fuchsia-200/30 to-transparent blur-3xl" />
      <div className="absolute bottom-[-200px] left-1/3 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-emerald-200/40 via-cyan-200/30 to-transparent blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
    </div>
  );
}
