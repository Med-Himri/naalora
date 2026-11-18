import Link from "next/link";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { STATUS_LABELS, STATUS_STYLES } from "@/components/admin/status";
import { PhoneIcon } from "@/components/icons";
import { listOrders, ORDER_STATUS_VALUES } from "@/lib/admin/repo";
import { getDictionary } from "@/lib/i18n";
import { fmt, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Commandes" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const filter = ORDER_STATUS_VALUES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : null;
  const orders = await listOrders();
  const shown = filter ? orders.filter((o) => o.status === filter) : orders;

  const sum = (list: typeof orders) => list.reduce((n, o) => n + o.total, 0);
  const stats = [
    { label: "Commandes", value: String(orders.length) },
    { label: "Nouvelles", value: String(orders.filter((o) => o.status === "nouveau").length) },
    { label: "Montant en cours", value: formatPrice(sum(orders.filter((o) => ["nouveau", "confirme", "expedie"].includes(o.status))), "fr") },
    { label: "Montant livré", value: formatPrice(sum(orders.filter((o) => o.status === "livre")), "fr") },
  ];
  const chip = (active: boolean) => `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium ${active ? "bg-ink text-paper" : "bg-paper shadow-soft hover:bg-sand"}`;

  return (
    <div>
      <h1 className="text-4xl">Commandes</h1>
      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <li key={s.label} className="rounded-[20px] bg-paper p-5 shadow-soft">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
          </li>
        ))}
      </ul>

      <nav aria-label="Filtrer par statut" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/commandes" className={chip(!filter)}>Toutes ({orders.length})</Link>
        {ORDER_STATUS_VALUES.map((s) => (
          <Link key={s} href={`/admin/commandes?status=${s}`} className={chip(filter === s)}>
            {STATUS_LABELS[s]} ({orders.filter((o) => o.status === s).length})
          </Link>
        ))}
      </nav>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-[20px] bg-paper p-8 text-center text-muted shadow-soft">Aucune commande pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {shown.map((o) => {
            const t = getDictionary(o.locale);
            const items = o.items.map((i) => `- ${i.qty} × ${i.name}${i.color.name ? ` — ${i.color.name}` : ""} (${o.locale === "ar" ? "المقاس" : "taille"} ${i.size})`).join("\n");
            const wa = fmt(t.orderConfirmMessage, { name: o.customer.name, ref: o.ref, items, total: formatPrice(o.total, o.locale), city: o.customer.city });
            const phoneDigits = o.customer.phone.replace(/\D/g, "");
            return (
              <li key={o.id}>
                <details className="group rounded-[20px] bg-paper shadow-soft [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:p-5">
                    <span className="font-mono font-bold tracking-wider">{o.ref}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[o.status]}`}>{STATUS_LABELS[o.status]}</span>
                    <span className="text-sm text-muted">{dateFmt.format(new Date(o.createdAt))}</span>
                    <span className="text-sm">{o.customer.name} · {o.customer.city}</span>
                    <span className="ms-auto font-semibold tabular-nums">{formatPrice(o.total, "fr")}</span>
                    <span className="text-xs uppercase text-muted">{o.locale}</span>
                  </summary>
                  <div className="grid gap-6 border-t border-line p-4 sm:p-5 lg:grid-cols-2">
                    <div>
                      <h2 className="text-lg">Articles</h2>
                      <table className="mt-2 w-full text-sm">
                        <tbody className="divide-y divide-line">
                          {o.items.map((i, k) => (
                            <tr key={k}>
                              <td className="py-2"><Link href={`/fr/produit/${i.slug}${i.color.key ? `?couleur=${i.color.key}` : ""}`} target="_blank" className="hover:underline">{i.name}</Link>{i.color.name && <span className="block text-xs text-muted">{i.color.name}</span>}</td>
                              <td className="py-2">T. {i.size}</td>
                              <td className="py-2">× {i.qty}</td>
                              <td className="py-2 text-end tabular-nums">{formatPrice(i.unitPrice * i.qty, "fr")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <dl className="mt-3 space-y-1 text-sm">
                        <div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd className="tabular-nums">{formatPrice(o.subtotal, "fr")}</dd></div>
                        <div className="flex justify-between"><dt className="text-muted">Livraison</dt><dd className="tabular-nums">{o.shipping ? formatPrice(o.shipping, "fr") : "Offerte"}</dd></div>
                        <div className="flex justify-between font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(o.total, "fr")}</dd></div>
                      </dl>
                    </div>
                    <div>
                      <h2 className="text-lg">Client</h2>
                      <dl className="mt-2 space-y-1.5 text-sm">
                        <div><dt className="inline text-muted">Nom : </dt><dd className="inline font-medium">{o.customer.name}</dd></div>
                        <div><dt className="inline text-muted">Téléphone : </dt><dd className="inline font-medium" dir="ltr">{o.customer.phone}</dd></div>
                        <div><dt className="inline text-muted">Ville : </dt><dd className="inline">{o.customer.city}</dd></div>
                        <div><dt className="inline text-muted">Adresse : </dt><dd className="inline whitespace-pre-line">{o.customer.address}</dd></div>
                        {o.customer.note && <div><dt className="inline text-muted">Note : </dt><dd className="inline">{o.customer.note}</dd></div>}
                      </dl>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <a href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(wa)}`} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp !min-h-10 !py-2 text-sm">
                          Confirmer sur WhatsApp
                        </a>
                        <a href={`tel:${o.customer.phone}`} className="btn btn-outline !min-h-10 !py-2 text-sm"><PhoneIcon width={16} height={16} /> Appeler</a>
                      </div>
                      <div className="mt-5"><OrderStatusForm id={o.id} status={o.status} /></div>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
