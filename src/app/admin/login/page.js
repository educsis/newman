import { redirect } from "next/navigation";
import { Sunrise, Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";
import { getCurrentUser, signIn } from "@/lib/auth";

async function authenticate(prevState, formData) {
  "use server";
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  if (!username || !password) {
    return { error: "Ingresa usuario y contraseña." };
  }

  const user = signIn(username, password);
  if (!user) {
    return { error: "Credenciales inválidas. Prueba de nuevo." };
  }

  redirect("/admin");
}

export default function AdminLoginPage() {
  const user = getCurrentUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.35),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-60 bg-[radial-gradient(circle_at_bottom,rgba(250,204,21,0.25),transparent_65%)]" />
      <div className="relative mx-auto grid w-full max-w-5xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700 shadow-md shadow-sky-900/10">
            <Sparkles className="h-4 w-4 text-sky-500" />
            Guardianes de la Palabra
          </span>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Administración celestial para historias llenas de fe.
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              Ingresa para elevar testimonios, devocionales y mensajes que
              renuevan la esperanza en Cristo. Cada palabra compartida es una
              luz más en el firmamento.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-inner shadow-sky-900/10 backdrop-blur">
            <Sunrise className="h-8 w-8 text-amber-400" />
            “Se levantan cada mañana nuevas misericordias.” (Lamentaciones 3:23)
          </div>
        </div>
        <LoginForm authenticate={authenticate} />
      </div>
    </div>
  );
}
