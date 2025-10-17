"use client";

import { useFormState } from "react-dom";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState = { error: null };

export default function LoginForm({ authenticate }) {
  const [state, formAction] = useFormState(authenticate, initialState);

  return (
    <form
      action={formAction}
      className="relative mx-auto flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-10 shadow-2xl shadow-sky-900/10 backdrop-blur"
    >
      <div className="absolute -right-24 top-0 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="relative flex flex-col gap-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-lg shadow-sky-900/10">
          <ShieldCheck className="h-8 w-8 text-sky-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            NEWMAN Admin
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Un espacio seguro para custodiar palabras de esperanza.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 text-left">
          <Label htmlFor="username" className="text-xs uppercase tracking-[0.35em]">
            Usuario
          </Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            placeholder="admin"
          />
        </div>
        <div className="flex flex-col gap-2 text-left">
          <Label htmlFor="password" className="text-xs uppercase tracking-[0.35em]">
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••"
          />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-600 shadow-inner shadow-rose-200/50">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="mt-2 h-12 gap-2 rounded-full text-base">
        <Sparkles className="h-4 w-4" />
        Entrar
      </Button>
    </form>
  );
}
