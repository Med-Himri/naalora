import Link from "next/link";
import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import AdminNav from "@/components/admin/AdminNav";
import { isAdmin } from "@/lib/admin/auth";
import { isDemo } from "@/lib/db";
import { logout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin");
  return (
    <div className="min-h-dvh pb-20">
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 rounded-[22px] border border-line/70 bg-paper/85 px-4 py-3 shadow-soft backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-paper sm:inline">Admin</span>
          </div>
          <AdminNav />
          <div className="flex items-center gap-2">
            <Link href="/fr" target="_blank" className="rounded-full px-3 py-2 text-sm text-muted hover:text-ink">Voir le site ↗</Link>
            <form action={logout}><button className="rounded-full bg-sand px-4 py-2 text-sm font-medium hover:bg-line">Déconnexion</button></form>
          </div>
        </div>
      </header>
      {isDemo && (
        <p className="mx-3 mt-3 rounded-2xl bg-accent-dark/10 xl:mx-auto xl:max-w-7xl px-4 py-2 text-sm text-accent-dark">
          Mode démo (MONGODB_URI absent) : les données sont en mémoire et sont perdues au redémarrage du serveur.
        </p>
      )}
      <main className="container-page mt-6">{children}</main>
    </div>
  );
}
