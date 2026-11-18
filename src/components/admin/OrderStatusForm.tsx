"use client";

import { useActionState, useRef } from "react";
import { changeOrderStatus, type AdminResult } from "@/app/admin/actions";
import { STATUS_LABELS } from "./status";
import type { OrderStatus } from "@/lib/types";

export default function OrderStatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const [state, action, pending] = useActionState<AdminResult | null, FormData>(changeOrderStatus, null);
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <label htmlFor={`st-${id}`} className="text-sm font-semibold">Statut</label>
      <select
        id={`st-${id}`}
        name="status"
        defaultValue={status}
        disabled={pending || status === "annule"}
        onChange={(e) => {
          if (e.target.value === "annule" && !confirm("Annuler cette commande ? Le stock sera remis en vente.")) {
            e.target.value = status;
            return;
          }
          form.current?.requestSubmit();
        }}
        className="field !w-auto !py-2"
      >
        {(Object.keys(STATUS_LABELS) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
      {pending && <span className="text-sm text-muted">Enregistrement…</span>}
      {state && <span role="status" className={`text-sm ${state.ok ? "text-success" : "text-accent-dark"}`}>{state.message}</span>}
    </form>
  );
}
