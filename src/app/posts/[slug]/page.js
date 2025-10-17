import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return { title: "Artículo no encontrado | NEWMAN" };
  }
  return {
    title: `${post.title} | NEWMAN`,
    description: post.content.replace(/<[^>]*>/g, " ").slice(0, 160),
  };
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("es-ES", {
    dateStyle: "full",
  });

  return (
    <div className="relative flex min-h-screen flex-col pb-20">
      <header className="mx-auto w-full max-w-5xl px-6 pt-10">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-800 shadow-md shadow-sky-900/10 transition hover:-translate-y-[2px]"
          >
            <Sparkles className="h-4 w-4 text-sky-500 transition group-hover:rotate-6" />
            NEWMAN
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="relative mt-12 overflow-hidden rounded-[40px] border border-white/60 bg-white/75 shadow-2xl shadow-sky-900/10 backdrop-blur">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.25),transparent_65%)]" />
          <div className="flex flex-col gap-8 p-10">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                Inspiración Cristiana
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
                <Calendar className="h-4 w-4 text-sky-500" />
                {formattedDate}
              </p>
            </div>

            {post.imagePath ? (
              <div className="relative overflow-hidden rounded-[28px] border border-white/60 shadow-xl shadow-sky-900/10">
                <img
                  src={post.imagePath}
                  alt={post.title}
                  className="max-h-[520px] w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-slate-900/10 to-transparent" />
              </div>
            ) : null}

            <article
              className="rich-text rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-inner shadow-sky-900/10 backdrop-blur"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="flex flex-col items-center justify-between gap-4 rounded-[28px] border border-white/60 bg-gradient-to-br from-white/80 via-sky-100/40 to-amber-100/40 p-6 text-center shadow-inner shadow-sky-900/10 backdrop-blur md:flex-row md:text-left">
              <p className="text-sm text-slate-600">
                “Que la esperanza del Evangelio ilumine cada paso de tu
                historia.”
              </p>
              <Button asChild variant="ghost" size="sm" className="gap-2">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4" />
                  Regresar al blog
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
