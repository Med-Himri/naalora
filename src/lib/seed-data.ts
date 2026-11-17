// Seed data: used by `npm run seed` and by demo mode (no MONGODB_URI).
// Relative imports with .ts extensions so plain Node can run the seed script.
import { SITE } from "./site.ts";

type L = { fr: string; ar: string };

export const seedCategories = [
  {
    slug: "pantoufles",
    name: { fr: "Pantoufles", ar: "بلغات" },
    intro: {
      fr: `Pantoufles plateforme en daim, doublées de peluche chaude, avec une semelle légère et antidérapante de 5 cm. Six couleurs, du 36 au 41, livrées partout au Maroc en ${SITE.deliveryHours.min} à ${SITE.deliveryHours.max} h avec paiement à la livraison.`,
      ar: `بلغات بنعل مرتفع من الجلد السويدي، ببطانة فرو دافئة ونعل خفيف مانع للانزلاق بارتفاع 5 سم. ستة ألوان، من 36 إلى 41، تصلك لجميع مدن المغرب خلال ${SITE.deliveryHours.min} إلى ${SITE.deliveryHours.max} ساعة مع الدفع عند الاستلام.`,
    },
    position: 1,
  },
];

type SeedColor = {
  key: string;
  code: string;
  color: L;
  hex: string;
  tone: "brown" | "pastel" | "dark" | "other";
  price: number;
  oldPrice: number;
  badge: "best" | "new" | "none";
};

const colors: SeedColor[] = [
  { key: "chocolat", code: "CHO", color: { fr: "Chocolat", ar: "شوكولا" }, hex: "#5a3a2b", tone: "brown", price: 349, oldPrice: 449, badge: "best" },
  { key: "camel", code: "CAM", color: { fr: "Camel", ar: "كاميل" }, hex: "#c98c55", tone: "brown", price: 349, oldPrice: 449, badge: "best" },
  { key: "bleu-ciel", code: "BLC", color: { fr: "Bleu Ciel", ar: "أزرق سماوي" }, hex: "#b7cfe2", tone: "pastel", price: 369, oldPrice: 469, badge: "new" },
  { key: "cedre", code: "CED", color: { fr: "Cèdre", ar: "أرزي" }, hex: "#7a4a30", tone: "brown", price: 369, oldPrice: 469, badge: "new" },
  { key: "noir", code: "NOI", color: { fr: "Noir", ar: "أسود" }, hex: "#1f1d1c", tone: "dark", price: 349, oldPrice: 449, badge: "none" },
  { key: "rose", code: "ROS", color: { fr: "Rose", ar: "وردي" }, hex: "#e590ac", tone: "pastel", price: 369, oldPrice: 469, badge: "new" },
];

const h = SITE.deliveryHours;

export const seedProducts = colors.map((c, i) => ({
  slug: `pantoufle-plateforme-${c.key}`,
  sku: `NA-PPL-${c.code}`,
  categorySlug: "pantoufles",
  name: { fr: `Pantoufle plateforme ${c.color.fr}`, ar: `بلغة بنعل مرتفع ${c.color.ar}` },
  summary: {
    fr: `Pantoufle plateforme en daim couleur ${c.color.fr.toLowerCase()}, doublée de peluche chaude, avec un col tressé en zigzag. Semelle légère et antidérapante de 5 cm. Disponible du 36 au 41, livrée partout au Maroc en ${h.min}–${h.max} h avec paiement à la livraison.`,
    ar: `بلغة بنعل مرتفع من الجلد السويدي باللون ${c.color.ar}، ببطانة فرو دافئة وحافة مضفورة على شكل متعرج. نعل خفيف ومانع للانزلاق بارتفاع 5 سم. متوفرة من 36 إلى 41، وتصلك لجميع مدن المغرب خلال ${h.min}–${h.max} ساعة مع الدفع عند الاستلام.`,
  },
  description: {
    fr: `La pantoufle plateforme ${c.color.fr} associe une tige en daim souple à une doublure peluche épaisse qui garde les pieds au chaud. Le col tressé en zigzag apporte une touche artisanale et maintient bien le pied.\n\nSa semelle plateforme de 5 cm est légère et antidérapante : vous gagnez quelques centimètres sans effort, à la maison comme pour une courte sortie par temps sec.`,
    ar: `تجمع بلغة النعل المرتفع باللون ${c.color.ar} بين جزء علوي من الجلد السويدي الناعم وبطانة فرو سميكة تحافظ على دفء القدمين. الحافة المضفورة على شكل متعرج تضيف لمسة تقليدية وتثبت القدم جيداً.\n\nنعلها المرتفع بـ 5 سم خفيف ومانع للانزلاق: طول إضافي بدون تعب، في المنزل أو في خرجة قصيرة في طقس جاف.`,
  },
  specs: {
    material: { fr: "Daim (tige)", ar: "جلد سويدي (الجزء العلوي)" },
    lining: { fr: "Peluche chaude", ar: "فرو دافئ" },
    soleHeight: { fr: "5 cm, antidérapante", ar: "5 سم، مانع للانزلاق" },
    care: {
      fr: "Brosse douce à sec, spray imperméabilisant. Pas de machine.",
      ar: "فرشاة ناعمة على الجاف، بخاخ عازل للماء. لا للغسالة.",
    },
  },
  colorName: c.color,
  swatchHex: c.hex,
  tone: c.tone,
  price: c.price,
  oldPrice: c.oldPrice,
  badge: c.badge,
  images: [1, 2].map((n) => ({
    url: `/placeholders/${c.key}-${n}.svg`,
    publicId: "",
    alt: {
      fr: `Pantoufle plateforme en daim ${c.color.fr}${n === 2 ? " — vue de côté" : ""}`,
      ar: `بلغة بنعل مرتفع من الجلد السويدي ${c.color.ar}${n === 2 ? " — منظر جانبي" : ""}`,
    },
    position: n - 1,
  })),
  sizes: [36, 37, 38, 39, 40, 41].map((size) => ({ size, stock: 10 })),
  active: true,
  position: i + 1,
}));

const sizeRowsFr = SITE.sizeChart.map((r) => `| ${r.size} | ${String(r.cm).replace(".", ",")} cm |`).join("\n");
const sizeRowsAr = SITE.sizeChart.map((r) => `| ${r.size} | ${r.cm} سم |`).join("\n");

export const seedGuides = [
  {
    slug: "guide-des-tailles-pantoufles",
    title: { fr: "Comment choisir la bonne taille de pantoufles", ar: "كيف تختارين المقاس المناسب للبلغة" },
    excerpt: {
      fr: "Mesurez votre pied en 2 minutes et trouvez votre pointure, du 36 au 41 : tableau en cm et conseils si vous êtes entre deux tailles.",
      ar: "قيسي قدمك في دقيقتين واعرفي مقاسك من 36 إلى 41: جدول بالسنتيمتر ونصائح إذا كنتِ بين مقاسين.",
    },
    content: {
      fr: `**En bref :** prenez votre pointure habituelle ; si vous êtes entre deux tailles, choisissez la taille au-dessus, car la doublure peluche est épaisse.

## Le tableau des tailles

| Pointure (EU) | Longueur du pied |
| --- | --- |
${sizeRowsFr}

## Mesurer son pied en 4 étapes

1. Posez une feuille de papier au sol, contre un mur.
2. Placez le talon contre le mur, debout, le poids bien réparti.
3. Marquez le bout de l’orteil le plus long, puis mesurez en centimètres.
4. Mesurez les deux pieds et gardez la plus grande valeur.

## Entre deux tailles ?

Une pantoufle doublée se porte souvent pieds nus ou avec des chaussettes fines. Si votre mesure tombe entre deux pointures, prenez la plus grande : la peluche se tasse un peu, mais pas assez pour compenser une taille trop petite.

## Et si la taille ne va pas ?

L’échange de taille est **gratuit pendant ${SITE.exchangeDays} jours** après la réception. Écrivez-nous sur WhatsApp avec votre numéro de commande ; l’article doit être non porté et dans son emballage d’origine.`,
      ar: `**باختصار:** اختاري مقاسك المعتاد؛ وإذا كنتِ بين مقاسين، فاختاري الأكبر لأن بطانة الفرو سميكة.

## جدول المقاسات

| المقاس (EU) | طول القدم |
| --- | --- |
${sizeRowsAr}

## قياس القدم في 4 خطوات

1. ضعي ورقة على الأرض بمحاذاة الحائط.
2. قفي واجعلي الكعب ملتصقاً بالحائط مع توزيع الوزن جيداً.
3. ضعي علامة عند طرف أطول إصبع، ثم قيسي بالسنتيمتر.
4. قيسي القدمين معاً واحتفظي بالقياس الأكبر.

## بين مقاسين؟

البلغة المبطنة تُلبس غالباً بدون جوارب أو بجوارب رقيقة. إذا كان قياسك بين مقاسين، فاختاري الأكبر: الفرو ينضغط قليلاً، لكن ليس بما يكفي لتعويض مقاس صغير.

## وإذا لم يناسبك المقاس؟

تبديل المقاس **مجاني خلال ${SITE.exchangeDays} أيام** من الاستلام. راسلينا على واتساب برقم الطلب؛ يجب أن يكون المنتج غير مستعمل وفي علبته الأصلية.`,
    },
    published: false,
  },
  {
    slug: "entretenir-le-daim",
    title: { fr: "Comment entretenir des pantoufles en daim", ar: "كيف تعتنين ببلغة من الجلد السويدي" },
    excerpt: {
      fr: "Brosse, spray imperméabilisant, taches et séchage : la méthode simple pour garder vos pantoufles en daim belles plus longtemps.",
      ar: "الفرشاة، البخاخ العازل، البقع والتجفيف: الطريقة البسيطة للحفاظ على جمال بلغتك من الجلد السويدي لمدة أطول.",
    },
    content: {
      fr: `**En bref :** brossez le daim à sec avec une brosse douce, protégez-le avec un spray imperméabilisant et ne le lavez jamais en machine.

## Avant de les porter

Vaporisez un spray imperméabilisant pour daim à 20 cm, sur des pantoufles propres et sèches. Laissez sécher une nuit. Renouvelez toutes les 4 à 6 semaines.

## L’entretien de chaque semaine

- Brossez dans le sens du poil avec une brosse douce (crêpe ou nylon souple).
- Pour redonner du volume, brossez ensuite à rebrousse-poil, doucement.
- Aérez la doublure peluche après le port.

## En cas de tache

1. Laissez sécher complètement, sans frotter quand c’est mouillé.
2. Brossez délicatement pour décoller la saleté.
3. Pour une marque tenace, utilisez une gomme spéciale daim.

## Les erreurs à éviter

- La machine à laver et le sèche-linge.
- Sécher près d’un radiateur ou en plein soleil : le daim durcit.
- Marcher sous la pluie ou dans les flaques.`,
      ar: `**باختصار:** نظفي الجلد السويدي بفرشاة ناعمة وهو جاف، واحميه ببخاخ عازل للماء، ولا تغسليه أبداً في الغسالة.

## قبل الارتداء

رشي بخاخاً عازلاً خاصاً بالجلد السويدي من مسافة 20 سم، على بلغة نظيفة وجافة. اتركيها تجف ليلة كاملة. أعيدي العملية كل 4 إلى 6 أسابيع.

## العناية الأسبوعية

- نظفي بالفرشاة في اتجاه الوبر بفرشاة ناعمة.
- لإعادة الحيوية، نظفي بعد ذلك عكس اتجاه الوبر بلطف.
- هوّي بطانة الفرو بعد الاستعمال.

## في حالة وجود بقعة

1. اتركيها تجف تماماً، بدون فرك وهي مبللة.
2. نظفيها بالفرشاة بلطف لإزالة الأوساخ.
3. للبقع الصعبة، استعملي ممحاة خاصة بالجلد السويدي.

## أخطاء يجب تجنبها

- الغسالة والمجفف.
- التجفيف قرب المدفأة أو تحت الشمس: الجلد السويدي يتصلب.
- المشي تحت المطر أو في البرك.`,
    },
    published: false,
  },
  {
    slug: "choisir-pantoufles-plateforme",
    title: { fr: "Comment choisir ses pantoufles plateforme", ar: "كيف تختارين بلغة بنعل مرتفع" },
    excerpt: {
      fr: "Hauteur de semelle, matière, doublure, couleur : les 5 critères pour choisir des pantoufles plateforme confortables.",
      ar: "ارتفاع النعل، الخامة، البطانة، اللون: 5 معايير لاختيار بلغة مريحة بنعل مرتفع.",
    },
    content: {
      fr: `**En bref :** choisissez une semelle légère et antidérapante d’environ 5 cm, une tige en daim souple et une doublure chaude, dans votre pointure habituelle.

## 1. La hauteur de semelle

Autour de 5 cm, la plateforme fait gagner de la hauteur sans fatiguer le pied. Au-delà, la marche devient moins naturelle pour un usage quotidien.

## 2. Une semelle légère et antidérapante

Soulevez la pantoufle : elle doit rester légère. Le dessous doit accrocher sur le carrelage, très fréquent dans les maisons au Maroc.

## 3. La matière de la tige

Le daim est doux, respirant et prend une jolie patine. Il demande simplement un spray imperméabilisant et un coup de brosse.

## 4. La doublure

Une peluche épaisse garde les pieds au chaud en hiver. Si vous êtes entre deux tailles, prenez la taille au-dessus.

## 5. La couleur

- **Bruns** (chocolat, camel, cèdre) : faciles à porter, ils marquent peu.
- **Pastels** (bleu ciel, rose) : plus doux et lumineux.
- **Noir** : sobre et élégant.

Toutes nos pantoufles plateforme sont livrées partout au Maroc en ${h.min}–${h.max} h, avec paiement à la livraison.`,
      ar: `**باختصار:** اختاري نعلاً خفيفاً ومانعاً للانزلاق بارتفاع حوالي 5 سم، وجزءاً علوياً من الجلد السويدي الناعم وبطانة دافئة، بمقاسك المعتاد.

## 1. ارتفاع النعل

في حدود 5 سم، يمنحك النعل المرتفع طولاً إضافياً بدون إتعاب القدم. أكثر من ذلك، يصبح المشي أقل راحة للاستعمال اليومي.

## 2. نعل خفيف ومانع للانزلاق

ارفعي البلغة: يجب أن تكون خفيفة. ويجب أن يثبت أسفلها جيداً على الزليج، المنتشر كثيراً في البيوت المغربية.

## 3. خامة الجزء العلوي

الجلد السويدي ناعم ويسمح بالتهوية ويزداد جمالاً مع الوقت. يحتاج فقط إلى بخاخ عازل وتنظيف بالفرشاة.

## 4. البطانة

بطانة فرو سميكة تحافظ على دفء القدمين في الشتاء. إذا كنتِ بين مقاسين، فاختاري الأكبر.

## 5. اللون

- **البني** (شوكولا، كاميل، أرزي): سهل التنسيق ولا تظهر عليه الأوساخ بسرعة.
- **الألوان الفاتحة** (أزرق سماوي، وردي): أنعم وأكثر إشراقاً.
- **الأسود**: بسيط وأنيق.

جميع بلغاتنا بنعل مرتفع تصلك لجميع مدن المغرب خلال ${h.min}–${h.max} ساعة، مع الدفع عند الاستلام.`,
    },
    published: false,
  },
];
