"use client";

import { useFormState } from "react-dom";
import { ImagePlus, Sparkles } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState = { error: null };

export default function CreatePostForm({ createPost }) {
  const [state, formAction] = useFormState(createPost, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="title"
          className="text-xs uppercase tracking-[0.35em] text-slate-500"
        >
          Título
        </Label>
        <Input
          id="title"
          type="text"
          name="title"
          required
          placeholder="Títulos que inspiran esperanza"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label
          htmlFor="image"
          className="text-xs uppercase tracking-[0.35em] text-slate-500"
        >
          Imagen destacada
        </Label>
        <label className="group flex flex-col items-center gap-2 rounded-2xl border border-dashed border-sky-200 bg-white/70 px-6 py-6 text-center text-sm text-slate-600 shadow-inner shadow-sky-900/10 transition hover:border-sky-300 hover:bg-white/80">
          <div className="flex items-center gap-3 text-sky-600">
            <ImagePlus className="h-5 w-5" />
            <span className="font-semibold">Subir imagen celestial</span>
          </div>
          <span className="text-xs text-slate-500">
            Opcional. Se almacenará en <code>/public/uploads</code>.
          </span>
          <Input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            className="hidden"
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase tracking-[0.35em] text-slate-500">
          Contenido
        </Label>
        <RichTextEditor name="content" />
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/85 px-4 py-3 text-sm font-medium text-rose-600 shadow-inner shadow-rose-200/60">
          {state.error}
        </div>
      ) : null}

      <Button type="submit" className="h-12 gap-2 rounded-full text-base">
        <Sparkles className="h-4 w-4" />
        Publicar mensaje
      </Button>
    </form>
  );
}
