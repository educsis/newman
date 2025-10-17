import Link from "next/link";
import { listPosts } from "@/lib/db";
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Sunrise,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

function getExcerpt(html) {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= 160) return text;
  return `${text.slice(0, 160)}…`;
}

export const dynamic = "force-dynamic";

export default function HomePage() {
  const posts = listPosts();

  return (
    <div className="relative flex min-h-screen flex-col pb-20">
      <header className="mx-auto w-full max-w-6xl px-6 pt-10">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-800 shadow-md shadow-sky-900/10 transition hover:-translate-y-[2px]"
          >
            <Sparkles className="h-4 w-4 text-sky-500 transition group-hover:rotate-6" />
            NEWMAN
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="#posts">Artículos</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/login">Entrar al panel</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="relative mt-12 overflow-hidden rounded-[40px] border border-white/60 bg-white/75 p-10 shadow-2xl shadow-sky-900/10 backdrop-blur">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.25),transparent_60%)]" />
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                <Sunrise className="h-4 w-4 text-amber-400" />
                Esperanza Viva
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Voces que apuntan al Cielo{" "}
                <span className="text-sky-600">y encienden esperanza.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">
                NEWMAN es un espacio cristiano minimalista donde cada relato,
                testimonio y meditación nos recuerda que la luz de Cristo sigue
                transformando vidas. Queremos caminar contigo en fe, belleza y
                propósito.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="#palabra">Palabra del día</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/admin/login">Compartir mi testimonio</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-sky-200/40 blur-3xl" />
              <div className="absolute -bottom-6 left-4 h-32 w-32 rounded-full bg-amber-100/70 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between rounded-[32px] border border-white/50 bg-white/80 p-6 text-slate-700 shadow-xl shadow-sky-900/10 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Heart className="h-10 w-10 text-rose-300" />
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Nuestra oración
                    </p>
                    <p className="text-base font-medium text-slate-700">
                      “Que Cristo sea formado en nosotros.”
                    </p>
                  </div>
                </div>
                <blockquote className="mt-8 text-lg leading-relaxed text-slate-600">
                  “Que el Dios de la esperanza los llene de toda alegría y paz a
                  ustedes que creen en Él, para que rebosen de esperanza por el
                  poder del Espíritu Santo.”
                </blockquote>
                <cite className="mt-6 text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
                  Romanos 15:13
                </cite>
              </div>
            </div>
          </div>
        </section>

        <section id="palabra" className="mt-16">
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white/85 via-sky-100/40 to-violet-100/50 p-8 shadow-xl shadow-sky-900/10 backdrop-blur">
            <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3),transparent_70%)]" />
            <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/80 shadow-lg shadow-sky-900/10">
                <BookOpen className="h-8 w-8 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                  Palabra de esperanza
                </p>
                <p className="mt-3 text-lg leading-relaxed text-slate-600 md:text-xl">
                  “La esperanza no defrauda, porque Dios ha derramado su amor en
                  nuestros corazones por el Espíritu Santo.” (Romanos 5:5)
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="posts" className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Últimas publicaciones
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Historias reales, reflexiones bíblicas y notas que celebran la
                gracia de Dios en la vida cotidiana.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/login">Publicar nuevo artículo</Link>
            </Button>
          </div>

          {posts.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-sky-200 bg-white/70 p-12 text-center text-slate-600 shadow-inner shadow-sky-900/10">
              Aún no hay publicaciones. Sé el primero en compartir una palabra
              de aliento.
            </div>
          ) : (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card key={post.id} className="group overflow-hidden p-0">
                  <div className="relative h-48 w-full overflow-hidden">
                    {post.imagePath ? (
                      <img
                        src={post.imagePath}
                        alt={post.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-amber-50">
                        <Sparkles className="h-10 w-10 text-sky-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/10 to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-100">
                      {new Date(post.createdAt).toLocaleDateString("es-ES", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <div className="flex h-full flex-col gap-4 p-6">
                    <CardTitle className="text-2xl text-slate-900">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-slate-600">
                      {getExcerpt(post.content)}
                    </CardDescription>
                    <CardFooter className="border-none p-0 pt-2">
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-sky-700 hover:text-sky-900"
                      >
                        <Link href={`/posts/${post.slug}`}>
                          Leer artículo
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-24 border-t border-white/50 bg-white/70 py-10 shadow-inner shadow-sky-900/5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center text-sm text-slate-500 md:flex-row md:text-left">
          <p>
            © {new Date().getFullYear()} NEWMAN. Resplandeciendo la esperanza en
            Cristo Jesús.
          </p>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Soli Deo Gloria
          </p>
        </div>
      </footer>
    </div>
  );
}
