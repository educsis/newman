import "./globals.css";

export const metadata = {
  title: "NEWMAN",
  description: "Blog minimalista para compartir historias y perspectivas.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased text-slate-900 selection:bg-sky-200/70 selection:text-slate-900">
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
