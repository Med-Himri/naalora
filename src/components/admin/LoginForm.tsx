"use client";

import { useActionState } from "react";
import { login, type AdminResult } from "@/app/admin/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(login, null);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="label">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" autoFocus />
      </div>
      {state && !state.ok && <p role="alert" className="text-sm font-medium text-accent-dark">{state.message}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
    </form>
  );
}
