import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import path from "path";
import { promises as fs } from "fs";
import { FileText, Sparkles, Eye, Trash2, LogOut } from "lucide-react";
import CreatePostForm from "./CreatePostForm";
import {
  deletePost,
  generateSlug,
  getPostById,
  listPosts,
  savePost,
} from "@/lib/db";
import { requireAdmin, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import {
  Card,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

async function persistImage(file) {
  if (!file || typeof file === "string" || file.size === 0) {
    return null;
  }
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(uploadsDir, safeName);
  await fs.writeFile(filePath, fileBuffer);
  return `/uploads/${safeName}`;
}

async function createPostAction(prevState, formData) {
  "use server";
  requireAdmin();
  const title = formData.get("title")?.toString().trim() ?? "";
  const content = formData.get("content")?.toString().trim() ?? "";
  const imageFile = formData.get("image");

  if (!title) {
    return { error: "El título es obligatorio." };
  }
  if (!content) {
    return { error: "El contenido no puede estar vacío." };
  }

  const imagePath = await persistImage(imageFile);
  const slug = generateSlug(title);
  savePost({ title, slug, imagePath, content });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

async function deletePostAction(formData) {
  "use server";
  requireAdmin();
  const id = Number(formData.get("postId"));
  if (!id) {
    redirect("/admin");
  }
  const post = getPostById(id);
  if (post?.imagePath) {
    const imageFsPath = path.join(process.cwd(), "public", post.imagePath);
    try {
      await fs.unlink(imageFsPath);
    } catch {
      // Ignore errors; file may not exist.
    }
  }
  deletePost(id);
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

async function logoutAction() {
  "use server";
  signOut();
  redirect("/admin/login");
}

export default async function AdminDashboard() {
  // Ensure this page is not statically generated
  const user = requireAdmin();
  const posts = listPosts();

  return (
    <div className="relative flex min-h-screen flex-col pb-20">
      <header className="mx-auto w-full max-w-6xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-sky-800 shadow-md shadow-sky-900/10 transition hover:-translate-y-[2px]"
          >
            <Sparkles className="h-4 w-4 text-sky-500 transition group-hover:rotate-6" />
            NEWMAN Admin
          </Link>
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="relative mt-12 overflow-hidden rounded-[40px] border border-white/60 bg-white/80 p-10 shadow-2xl shadow-sky-900/10 backdrop-blur">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(59,130,246,0.3),transparent_60%),radial-gradient(circle_at_80%_10%,rgba(250,204,21,0.25),transparent_60%)]" />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                <FileText className="h-4 w-4 text-sky-500" />
                Nuevo artículo
              </span>
              <div className="space-y-4 text-slate-600">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                  Comparte el mensaje que el cielo ha puesto en tu corazón.
                </h1>
                <p className="text-base leading-relaxed">
                  Cada publicación es una llama encendida. Inspira a la iglesia,
                  comparte testimonios y edifica a quienes buscan esperanza en
                  Cristo Jesús.
                </p>
              </div>
              <CreatePostForm createPost={createPostAction} />
            </div>
            <div className="flex flex-col gap-4 rounded-[32px] border border-white/60 bg-gradient-to-br from-white/80 via-sky-100/40 to-amber-100/40 p-6 text-slate-600 shadow-inner shadow-sky-900/10 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
                Consejos de redacción
              </p>
              <ul className="grid gap-3 text-sm leading-relaxed">
                <li>
                  • Comienza con un versículo o reflexión que encienda el
                  mensaje.
                </li>
                <li>• Aporta claridad: testimonios breves, ideas claves.</li>
                <li>
                  • Incluye una invitación práctica o una oración de cierre.
                </li>
              </ul>
              <p className="rounded-3xl border border-white/70 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-inner shadow-sky-900/10">
                “Que la palabra de Cristo habite ricamente en ustedes.” (Colosenses
                3:16)
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Publicaciones recientes
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Administra, revisa y comparte las palabras ya publicadas.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/">Ver blog público</Link>
            </Button>
          </div>

          {posts.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-sky-200 bg-white/70 p-12 text-center text-slate-600 shadow-inner shadow-sky-900/10">
              Aún no hay artículos publicados. Publica el primero para encender
              la esperanza.
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex flex-col gap-4">
                    <CardTitle className="text-2xl text-slate-900">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm uppercase tracking-[0.3em] text-slate-400">
                      Publicado el{" "}
                      {new Date(post.createdAt).toLocaleString("es-ES", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </CardDescription>
                    <CardFooter className="border-none p-0">
                      <div className="flex items-center gap-3">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-sky-700 hover:text-sky-900"
                        >
                          <Link href={`/posts/${post.slug}`}>
                            <Eye className="h-4 w-4" />
                            Ver artículo
                          </Link>
                        </Button>
                        <form action={deletePostAction}>
                          <input type="hidden" name="postId" value={post.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </Button>
                        </form>
                      </div>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
