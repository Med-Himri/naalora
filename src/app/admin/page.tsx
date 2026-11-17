import { redirect } from "next/navigation";
import Logo from "@/components/layout/Logo";
import LoginForm from "@/components/admin/LoginForm";
import { adminEnabled, isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Connexion" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/commandes");
  const enabled = adminEnabled();
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-[24px] bg-paper p-7 shadow-lift">
        <Logo />
        <h1 className="mt-6 text-3xl">Administration</h1>
        {enabled ? (
          <>
            {!process.env.ADMIN_PASSWORD && (
              <p className="mt-3 rounded-xl bg-sand p-3 text-sm">Mode développement : mot de passe par défaut <code className="font-semibold">admin</code>.</p>
            )}
            <LoginForm />
          </>
        ) : (
          <p className="mt-4 rounded-xl bg-sand p-4 text-sm">Admin désactivé : définissez la variable <code className="font-semibold">ADMIN_PASSWORD</code> sur le serveur.</p>
        )}
      </div>
    </main>
  );
}
