import ShippingForm from "@/components/admin/ShippingForm";
import { Section } from "@/components/admin/fields";
import { loadShippingFresh } from "@/lib/data";

export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  const shipping = await loadShippingFresh();
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-4xl">Réglages</h1>
      <Section title="Livraison">
        <ShippingForm current={shipping} />
      </Section>
    </div>
  );
}
