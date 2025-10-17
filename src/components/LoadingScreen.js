import { Sparkles } from "lucide-react";

export default function LoadingScreen({ label = "CARGANDO..." }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-amber-50">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.18),transparent_60%)]" />
      <div className="flex flex-col items-center gap-6 rounded-[32px] border border-white/60 bg-white/80 px-10 py-12 shadow-2xl shadow-sky-900/10 backdrop-blur">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-sky-200">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <Sparkles className="h-5 w-5 text-sky-500" />
          <span className="text-sm font-semibold uppercase tracking-[0.35em]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
