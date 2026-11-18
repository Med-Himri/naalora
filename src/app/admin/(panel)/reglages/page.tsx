import ShippingForm from "@/components/admin/ShippingForm";
import HeroImageForm from "@/components/admin/HeroImageForm";
import { Section } from "@/components/admin/fields";
import { loadHeroFresh, loadShippingFresh } from "@/lib/data";

export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  const [shipping, hero] = await Promise.all([loadShippingFresh(), loadHeroFresh()]);
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-4xl">Réglages</h1>
      <Section title="Livraison">
        <ShippingForm current={shipping} />
      </Section>
      <Section title="Image d’accueil">
        <HeroImageForm hero={hero} />
      </Section>
    </div>
  );
}
