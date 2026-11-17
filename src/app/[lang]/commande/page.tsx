import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { cityOptions, getDictionary } from "@/lib/i18n";
import { isLocale } from "@/lib/locales";
import { SITE } from "@/lib/site";
import { paths } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/commande">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  // Checkout + thank-you screen: never indexed.
  return pageMetadata({ lang, path: paths.checkout, title: t.meta.checkoutTitle, description: t.checkout.intro, noindex: true });
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/commande">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <div className="container-page pt-8 sm:pt-10">
      <CheckoutForm
        lang={lang}
        cities={cityOptions(lang)}
        whatsappNumber={SITE.whatsapp}
        t={{
          checkout: t.checkout,
          cart: t.cart,
          thanks: t.thanks,
          a11y: { increase: t.a11y.increase, decrease: t.a11y.decrease, quantity: t.product.quantity },
        }}
      />
    </div>
  );
}
