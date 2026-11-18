import "server-only";
import { SITE, displayPhone } from "./site";
import type { Locale } from "./locales";
import { formatPrice } from "./format";
import { getShippingSettings } from "./data";
import { hasFreeThreshold, isFreeShipping, type ShippingSettings } from "./pricing";

/**
 * All user-facing texts (fr + ar).
 * Only plain strings / arrays / objects — so parts can be passed to client components as props.
 * Placeholders like {amount} are filled with fmt() from src/lib/format.ts.
 */

const S = SITE;
const phone = displayPhone();
const d = S.deliveryDays;
const h = S.deliveryHours;

const fr = {
  langName: "Français",
  meta: {
    siteDescription: `Naalora, boutique de chaussures au Maroc : pantoufles plateforme en daim, paiement à la livraison, livraison ${h.min}–${h.max} h partout au Maroc.`,
    homeTitle: "Pantoufles plateforme en daim — Livraison Maroc | Naalora",
    homeDescription: `Pantoufles plateforme en daim doublées, semelle 5 cm. Paiement à la livraison, livraison en ${h.min}–${h.max} h dans tout le Maroc, échange de taille ${S.exchangeDays} jours.`,
    shopTitle: "Boutique de chaussures en ligne au Maroc",
    shopDescription: `Toutes les chaussures Naalora : pantoufles plateforme en daim et nouveautés. Paiement à la livraison, livraison ${d.min}–${d.max} jours partout au Maroc.`,
    categoryTitle: "{name} — Achat en ligne au Maroc",
    categoryDescription: "{intro}",
    guidesTitle: "Guides chaussures : tailles, entretien, conseils",
    guidesDescription: "Conseils Naalora pour choisir sa taille, entretenir le daim et bien choisir ses pantoufles plateforme.",
    sizeGuideTitle: "Guide des tailles (36 à 41) — Pointures en cm",
    sizeGuideDescription: "Trouvez votre pointure Naalora : correspondance taille EU et longueur du pied en cm, de 36 (22,5 cm) à 41 (26,5 cm), et méthode de mesure.",
    faqTitle: "FAQ — Paiement, livraison et échange au Maroc",
    faqDescription: `Réponses claires : paiement à la livraison, délais ${h.min}–${h.max} h, {shipShort}, échange de taille ${S.exchangeDays} jours, entretien du daim.`,
    aboutTitle: "À propos de Naalora — Chaussures à Casablanca",
    aboutDescription: `Naalora est une boutique de chaussures basée à Casablanca. Livraison dans tout le Maroc, paiement à la livraison et échange de taille ${S.exchangeDays} jours.`,
    checkoutTitle: "Finaliser ma commande",
    notFoundTitle: "Page introuvable",
  },
  a11y: {
    skip: "Aller au contenu",
    mainNav: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    openCart: "Ouvrir le panier",
    cartCount: "{count} article(s) dans le panier",
    closeCart: "Fermer le panier",
    theme: "Changer de thème (clair / sombre)",
    switchLang: "Lire en arabe",
    breadcrumb: "Fil d’Ariane",
    home: "Accueil Naalora",
    increase: "Augmenter la quantité",
    decrease: "Diminuer la quantité",
    remove: "Retirer {name} du panier",
    thumbnail: "Voir l’image {n}",
    colorLink: "Voir la couleur {name}",
  },
  nav: {
    home: "Accueil",
    shop: "Boutique",
    guides: "Guides",
    faq: "FAQ",
    about: "À propos",
    sizeGuide: "Guide des tailles",
    menu: "Menu",
    langShort: "ع",
    langCurrent: "FR",
  },
  trust: [
    { title: "Paiement à la livraison", text: "Vous payez en espèces à la réception." },
    { title: `Livraison ${h.min}–${h.max} h`, text: "Partout au Maroc — {shipShort}." },
    { title: `Échange de taille ${S.exchangeDays} jours`, text: "Gratuit, si la pointure ne vous va pas." },
    { title: "Support WhatsApp", text: "Une vraie personne vous répond." },
  ],
  home: {
    eyebrow: "Nouvelle collection",
    title: "Le confort plateforme, en daim tout doux.",
    text: "Des pantoufles plateforme en daim, doublées bien chaud, avec une semelle légère de 5 cm. Pensées au Maroc, livrées chez vous en 1 à 3 jours.",
    ctaShop: "Découvrir la boutique",
    ctaGuide: "Trouver ma taille",
    fromPrice: "à partir de {price}",
    colorsLabel: "Couleurs disponibles",
    categoriesTitle: "Nos catégories",
    categoriesText: "Les pantoufles d’abord, d’autres chaussures bientôt.",
    bestTitle: "Les plus aimées",
    bestText: "Nos modèles les plus commandés en ce moment.",
    seeAll: "Voir tout",
    featuresEyebrow: "Pourquoi Naalora",
    featuresTitle: "Des détails qui font la différence.",
    features: [
      { title: "Daim souple", text: "Une tige en daim doux au toucher, qui se patine joliment avec le temps." },
      { title: "Doublure chaude", text: "Une doublure peluche épaisse pour garder les pieds au chaud tout l’hiver." },
      { title: "Semelle 5 cm", text: "Une plateforme légère et antidérapante, pour gagner en hauteur sans effort." },
    ],
    guidesTitle: "Conseils & guides",
    guidesText: "Tailles, entretien, choix : tout pour bien acheter.",
    faqTitle: "Questions fréquentes",
    faqMore: "Toutes les questions",
    soon: "Bientôt",
    productsCount: "{count} modèles",
    upcoming: ["Baskets", "Sandales", "Bottes"],
    heroImageAlt: "Pieds en chaussettes douillettes dans des pantoufles en peluche, sur un tapis en fourrure",
  },
  product: {
    badgeBest: "Best-seller",
    badgeNew: "Nouveau",
    save: "−{amount}",
    saveLong: "Vous économisez {amount}",
    inStock: "En stock — expédié sous 24 h",
    lowStock: "Plus que {count} paires disponibles",
    outOfStock: "Épuisé pour le moment",
    color: "Couleur",
    size: "Taille (EU)",
    soldOut: "Épuisé",
    sizeGuide: "Guide des tailles",
    quantity: "Quantité",
    addToCart: "Ajouter au panier",
    added: "Ajouté !",
    orderNow: "Commander maintenant",
    chooseSize: "Choisissez votre taille pour continuer.",
    specsTitle: "Caractéristiques",
    specs: {
      material: "Matière",
      lining: "Doublure",
      sole: "Hauteur de semelle",
      sizes: "Tailles",
      colors: "Couleurs",
      care: "Entretien",
      delivery: "Délai de livraison",
      price: "Prix",
      sku: "Référence",
    },
    deliveryValue: `${h.min} à ${h.max} h (${d.min} à ${d.max} jours) partout au Maroc`,
    deliveryTitle: "Livraison & paiement",
    deliveryText: `Livraison dans tout le Maroc en ${h.min} à ${h.max} h. {shipSentence} Paiement en espèces à la livraison, sans carte bancaire.`,
    exchangeTitle: "Échange de taille",
    exchangeText: `La taille ne vous va pas ? Écrivez-nous sur WhatsApp dans les ${S.exchangeDays} jours suivant la réception : nous échangeons gratuitement contre une autre pointure (article non porté, dans son emballage d’origine).`,
    faqTitle: "Questions sur ce produit",
    faq: [
      {
        q: "Quelle taille choisir ?",
        a: "Prenez votre pointure habituelle. Si vous êtes entre deux tailles, choisissez la taille au-dessus : la doublure peluche est épaisse. Le guide des tailles donne la longueur du pied en cm pour chaque pointure.",
      },
      {
        q: "Peut-on les porter dehors ?",
        a: "Oui, pour de courtes sorties par temps sec. La semelle de 5 cm est antidérapante, mais le daim n’aime pas l’eau : évitez la pluie et les flaques.",
      },
      {
        q: "Comment les entretenir ?",
        a: "Brossez le daim à sec avec une brosse douce et utilisez un spray imperméabilisant. Ne les passez pas en machine. Notre guide d’entretien détaille chaque étape.",
      },
      {
        q: "Quand vais-je recevoir ma commande ?",
        a: `En ${h.min} à ${h.max} h dans tout le Maroc. Nous vous appelons ou vous écrivons sur WhatsApp pour confirmer avant l’envoi.`,
      },
    ],
    alsoLike: "Vous aimerez aussi",
    otherColors: "Autres couleurs",
    colorsCount: "{count} couleurs",
    colorSoldOut: "{name} — épuisé",
    fromPrice: "dès {price}",
  },
  shop: {
    title: "Boutique",
    intro: "Toutes nos chaussures, livrées partout au Maroc avec paiement à la livraison.",
    all: "Tout",
    categories: "Catégories",
    tone: "Teinte",
    tones: { all: "Toutes", brown: "Bruns", pastel: "Pastels", dark: "Foncés", other: "Autres" },
    sort: "Trier",
    sorts: { popular: "Populaires", "price-asc": "Prix croissant", "price-desc": "Prix décroissant" },
    count: "{count} modèle(s)",
    empty: "Aucun modèle ne correspond à ces filtres.",
    reset: "Voir tous les modèles",
    filters: "Filtres",
    relatedGuides: "Guides utiles",
  },
  cart: {
    title: "Votre panier",
    empty: "Votre panier est vide.",
    emptyCta: "Découvrir la boutique",
    subtotal: "Sous-total",
    shipping: "Livraison",
    free: "Offerte",
    total: "Total",
    leftForFree: "Plus que {amount} pour la livraison offerte",
    freeReached: "Bravo, la livraison est offerte !",
    freeEverywhere: "Livraison gratuite partout au Maroc",
    checkout: "Commander — paiement à la livraison",
    continue: "Continuer mes achats",
    sizeLabel: "Taille {size}",
    remove: "Retirer",
  },
  checkout: {
    title: "Finaliser ma commande",
    intro: "Paiement à la livraison uniquement. Nous vous contactons pour confirmer avant l’envoi.",
    contact: "Vos coordonnées",
    name: "Nom complet",
    namePh: "Ex. : Salma Benali",
    phone: "Téléphone",
    phonePh: "06 12 34 56 78",
    phoneHelp: "Numéro marocain : 06, 07 ou 05 + 8 chiffres, ou +212.",
    city: "Ville",
    cityPh: "Choisissez votre ville",
    address: "Adresse de livraison",
    addressPh: "Quartier, rue, numéro, étage…",
    note: "Note (facultatif)",
    notePh: "Ex. : appeler avant de passer",
    summary: "Récapitulatif",
    submit: "Confirmer la commande",
    submitting: "Envoi en cours…",
    cod: "Vous payez en espèces au livreur, à la réception.",
    emptyCart: "Votre panier est vide.",
    backToShop: "Retour à la boutique",
    secure: "Vos données servent uniquement à livrer votre commande.",
    errors: {
      name: "Indiquez votre nom complet (2 caractères minimum).",
      phone: "Numéro invalide : 06, 07 ou 05 suivi de 8 chiffres (ou +212).",
      city: "Choisissez votre ville.",
      address: "Indiquez une adresse complète (8 caractères minimum).",
      cart: "Votre panier est vide ou contient un article invalide.",
      stock: "Stock insuffisant : {items}. Ajustez votre panier puis réessayez.",
      productGone: "Un article n’est plus disponible : {items}.",
      generic: "Une erreur est survenue. Réessayez ou commandez sur WhatsApp.",
      rate: "Trop de tentatives. Réessayez dans quelques minutes.",
    },
  },
  thanks: {
    title: "Merci, votre commande est enregistrée !",
    ref: "Numéro de commande",
    text: `Nous vous contactons très vite pour confirmer. Livraison en ${h.min}–${h.max} h, paiement à la réception : {total}.`,
    whatsapp: "Envoyer ma commande sur WhatsApp",
    whatsappHelp: "Pour une confirmation plus rapide.",
    back: "Retour à la boutique",
    waMessage: "Bonjour Naalora, je viens de passer la commande {ref} ({total}).\n{items}\nNom : {name}\nVille : {city}",
  },
  guides: {
    title: "Guides & conseils",
    intro: "Nos conseils pour choisir la bonne taille, entretenir vos chaussures et bien choisir vos modèles.",
    readMore: "Lire le guide",
    author: "Équipe Naalora",
    by: "Par",
    updated: "Mis à jour le {date}",
    empty: "Les premiers guides arrivent très bientôt.",
    shopCta: "Voir les pantoufles",
    related: "Autres guides",
  },
  sizeGuide: {
    title: "Guide des tailles",
    intro: "Nos pointures vont du 36 au 41 (tailles européennes). Mesurez votre pied et comparez avec le tableau ci-dessous.",
    tableCaption: "Correspondance pointure EU / longueur du pied",
    colSize: "Pointure (EU)",
    colCm: "Longueur du pied",
    howTitle: "Comment mesurer votre pied",
    steps: [
      "Posez une feuille de papier au sol, contre un mur.",
      "Placez votre talon contre le mur, debout, le poids bien réparti.",
      "Marquez le bout de l’orteil le plus long, puis mesurez en cm.",
      "Mesurez les deux pieds et gardez la plus grande valeur.",
    ],
    tip: "Entre deux tailles ? Prenez la taille au-dessus : la doublure peluche est épaisse.",
    exchange: `Et si la taille ne va pas, l’échange est gratuit pendant ${S.exchangeDays} jours.`,
    cm: "{cm} cm",
  },
  faq: {
    title: "Questions fréquentes",
    intro: "Paiement, livraison, tailles et entretien : les réponses à vos questions.",
    updated: "Dernière mise à jour : {date}",
    more: "Une autre question ?",
    moreText: "Écrivez-nous sur WhatsApp, nous répondons rapidement.",
    items: [
      {
        q: "Comment fonctionne le paiement à la livraison ?",
        a: `Vous payez en espèces au livreur au moment où vous recevez votre colis. Aucune carte bancaire n’est demandée : vous passez commande sur le site, nous vous contactons pour confirmer, puis le livreur vous remet le colis contre paiement du montant affiché (frais de livraison inclus).`,
      },
      {
        q: "Quels sont les moyens de paiement ?",
        a: "Le paiement se fait uniquement en espèces à la livraison. Le paiement par carte en ligne n’est pas proposé pour le moment.",
      },
      {
        q: "Quel est le délai de livraison ?",
        a: `La livraison prend ${h.min} à ${h.max} heures (${d.min} à ${d.max} jours) partout au Maroc. Les commandes confirmées sont expédiées le jour même ou le lendemain depuis Casablanca.`,
      },
      {
        q: "Combien coûte la livraison ?",
        a: "{shipFaq}",
      },
      {
        q: "Livrez-vous dans tout le Maroc ?",
        a: "Oui, nous livrons dans toutes les villes du Maroc : Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir et partout ailleurs.",
      },
      {
        q: "Puis-je échanger ma taille ?",
        a: `Oui, l’échange de taille est gratuit pendant ${S.exchangeDays} jours après la réception. Écrivez-nous sur WhatsApp avec votre numéro de commande ; l’article doit être non porté et dans son emballage d’origine.`,
      },
      {
        q: "Comment choisir sa taille ?",
        a: "Prenez votre pointure habituelle et, si vous êtes entre deux tailles, la taille au-dessus. Notre guide des tailles indique la longueur du pied pour chaque pointure : 36 = 22,5 cm, 37 = 23,5 cm, 38 = 24 cm, 39 = 25 cm, 40 = 25,5 cm, 41 = 26,5 cm.",
      },
      {
        q: "Comment entretenir des pantoufles en daim ?",
        a: "Brossez le daim à sec avec une brosse douce et protégez-le avec un spray imperméabilisant. Ne lavez jamais les pantoufles en machine ; en cas de tache, laissez sécher puis brossez délicatement.",
      },
      {
        q: "Où acheter des pantoufles plateforme au Maroc ?",
        a: `Vous pouvez acheter des pantoufles plateforme en daim sur naalora.com, avec livraison dans tout le Maroc en ${h.min}–${h.max} h et paiement à la livraison. Naalora est basée à Casablanca et propose 6 couleurs, du 36 au 41.`,
      },
      {
        q: "Comment suivre ou modifier ma commande ?",
        a: `Contactez-nous sur WhatsApp (${phone}) avec votre numéro de commande. Tant que la commande n’est pas expédiée, nous pouvons modifier la taille, la couleur ou l’adresse.`,
      },
    ],
  },
  about: {
    title: "À propos de Naalora",
    lead: "Naalora est une boutique de chaussures en ligne basée à Casablanca. Nous commençons par ce que nous aimons le plus porter à la maison : des pantoufles plateforme en daim, chaudes et confortables.",
    sections: [
      {
        title: "Qui sommes-nous",
        text: "Une petite équipe à Casablanca qui sélectionne chaque modèle, contrôle chaque paire avant l’envoi et répond elle-même à vos messages. Les pantoufles d’abord ; baskets, sandales et bottes arrivent ensuite.",
      },
      {
        title: "Ce qui rend nos pantoufles différentes",
        text: "Une tige en daim souple, une doublure peluche épaisse, un col tressé en zigzag et une semelle plateforme légère et antidérapante de 5 cm. Un modèle simple, décliné en 6 couleurs.",
      },
      {
        title: "Livraison & paiement",
        text: `Livraison partout au Maroc en ${h.min} à ${h.max} h. {shipSentence} Paiement en espèces à la livraison.`,
      },
      {
        title: "Échange de taille",
        text: `Échange de pointure gratuit pendant ${S.exchangeDays} jours après réception, pour un article non porté dans son emballage d’origine.`,
      },
    ],
    contactTitle: "Nous contacter",
    contactText: "Le plus rapide : WhatsApp. Nous répondons 7j/7.",
    whatsapp: "WhatsApp",
    email: "E-mail",
    city: "Ville",
  },
  footer: {
    tagline: "Chaussures confortables, livrées partout au Maroc. Paiement à la livraison.",
    shop: "Boutique",
    help: "Aide",
    company: "Naalora",
    contact: "Contact",
    allProducts: "Tous les produits",
    rights: "Tous droits réservés.",
    city: `Basée à ${S.city.fr}, Maroc`,
  },
  notFound: {
    title: "Oups, cette page s’est fait la malle.",
    text: "La page que vous cherchez n’existe pas ou a été déplacée.",
    shop: "Voir la boutique",
    home: "Retour à l’accueil",
  },
  cities: [
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda", "Kénitra", "Tétouan",
    "Salé", "Témara", "Mohammédia", "El Jadida", "Safi", "Béni Mellal", "Nador", "Khouribga", "Settat",
    "Laâyoune", "Essaouira", "Ouarzazate", "Autre",
  ],
  orderConfirmMessage: `Bonjour {name}, ici Naalora 👋\nNous confirmons votre commande {ref} :\n{items}\nTotal : {total} (paiement à la livraison).\nLivraison à {city} sous ${h.min}–${h.max} h. Merci de votre confiance !`,
  breadcrumbHome: "Accueil",
};

export type Dictionary = typeof fr;

const ar: Dictionary = {
  langName: "العربية",
  meta: {
    siteDescription: `Naalora متجر أحذية في المغرب: بلغات بنعل مرتفع من الجلد السويدي، الدفع عند الاستلام، توصيل خلال ${h.min}–${h.max} ساعة لجميع المدن.`,
    homeTitle: "بلغات بنعل مرتفع — توصيل لجميع مدن المغرب | Naalora",
    homeDescription: `بلغات من الجلد السويدي ببطانة دافئة ونعل 5 سم. الدفع عند الاستلام، توصيل خلال ${h.min}–${h.max} ساعة في كل المغرب، وتبديل المقاس خلال ${S.exchangeDays} أيام.`,
    shopTitle: "متجر أحذية أونلاين في المغرب",
    shopDescription: `جميع أحذية Naalora: بلغات بنعل مرتفع من الجلد السويدي والجديد. الدفع عند الاستلام وتوصيل خلال ${d.min}–${d.max} أيام لكل المغرب.`,
    categoryTitle: "{name} — شراء أونلاين في المغرب",
    categoryDescription: "{intro}",
    guidesTitle: "دلائل الأحذية: المقاسات، العناية، النصائح",
    guidesDescription: "نصائح Naalora لاختيار المقاس، والعناية بالجلد السويدي، واختيار البلغة المناسبة.",
    sizeGuideTitle: "دليل المقاسات (36 إلى 41) — طول القدم بالسنتيمتر",
    sizeGuideDescription: "اعرفي مقاسك في Naalora: المقاس الأوروبي وطول القدم بالسنتيمتر، من 36 (22.5 سم) إلى 41 (26.5 سم)، مع طريقة القياس.",
    faqTitle: "أسئلة شائعة — الدفع والتوصيل والتبديل",
    faqDescription: `إجابات واضحة: الدفع عند الاستلام، التوصيل خلال ${h.min}–${h.max} ساعة، {shipShort}، تبديل المقاس ${S.exchangeDays} أيام.`,
    aboutTitle: "من نحن — Naalora أحذية من الدار البيضاء",
    aboutDescription: `Naalora متجر أحذية مقره الدار البيضاء. توصيل لكل المغرب، الدفع عند الاستلام وتبديل المقاس خلال ${S.exchangeDays} أيام.`,
    checkoutTitle: "إتمام الطلب",
    notFoundTitle: "الصفحة غير موجودة",
  },
  a11y: {
    skip: "الانتقال إلى المحتوى",
    mainNav: "القائمة الرئيسية",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    openCart: "فتح السلة",
    cartCount: "{count} منتج في السلة",
    closeCart: "إغلاق السلة",
    theme: "تغيير المظهر (فاتح / داكن)",
    switchLang: "Lire en français",
    breadcrumb: "مسار التنقل",
    home: "الصفحة الرئيسية Naalora",
    increase: "زيادة الكمية",
    decrease: "تقليل الكمية",
    remove: "حذف {name} من السلة",
    thumbnail: "عرض الصورة {n}",
    colorLink: "عرض اللون {name}",
  },
  nav: {
    home: "الرئيسية",
    shop: "المتجر",
    guides: "الدلائل",
    faq: "أسئلة شائعة",
    about: "من نحن",
    sizeGuide: "دليل المقاسات",
    menu: "القائمة",
    langShort: "FR",
    langCurrent: "ع",
  },
  trust: [
    { title: "الدفع عند الاستلام", text: "تدفعين نقداً عند وصول الطلب." },
    { title: `توصيل خلال ${h.min}–${h.max} ساعة`, text: "لجميع مدن المغرب — {shipShort}." },
    { title: `تبديل المقاس خلال ${S.exchangeDays} أيام`, text: "مجاناً إذا لم يناسبك المقاس." },
    { title: "دعم عبر واتساب", text: "شخص حقيقي يجيب على رسائلك." },
  ],
  home: {
    eyebrow: "تشكيلة جديدة",
    title: "راحة النعل المرتفع، بجلد سويدي ناعم.",
    text: "بلغات بنعل مرتفع من الجلد السويدي، ببطانة دافئة ونعل خفيف بارتفاع 5 سم. مصممة في المغرب وتصلك إلى باب منزلك خلال 1 إلى 3 أيام.",
    ctaShop: "اكتشفي المتجر",
    ctaGuide: "اعرفي مقاسك",
    fromPrice: "ابتداءً من {price}",
    colorsLabel: "الألوان المتوفرة",
    categoriesTitle: "أصنافنا",
    categoriesText: "البلغات أولاً، وأحذية أخرى قريباً.",
    bestTitle: "الأكثر طلباً",
    bestText: "الموديلات الأكثر طلباً حالياً.",
    seeAll: "عرض الكل",
    featuresEyebrow: "لماذا Naalora",
    featuresTitle: "تفاصيل تصنع الفرق.",
    features: [
      { title: "جلد سويدي ناعم", text: "جزء علوي من الجلد السويدي الناعم الملمس، يزداد جمالاً مع الوقت." },
      { title: "بطانة دافئة", text: "بطانة فرو سميكة تحافظ على دفء القدمين طوال الشتاء." },
      { title: "نعل 5 سم", text: "نعل مرتفع خفيف ومانع للانزلاق، لطول إضافي بدون تعب." },
    ],
    guidesTitle: "نصائح ودلائل",
    guidesText: "المقاسات، العناية، الاختيار: كل ما تحتاجينه لشراء موفق.",
    faqTitle: "أسئلة شائعة",
    faqMore: "كل الأسئلة",
    soon: "قريباً",
    productsCount: "{count} موديلات",
    upcoming: ["أحذية رياضية", "صنادل", "أحذية طويلة"],
    heroImageAlt: "قدمان بجوارب دافئة في بلغة ناعمة من الفرو، على سجادة من الفرو",
  },
  product: {
    badgeBest: "الأكثر مبيعاً",
    badgeNew: "جديد",
    save: "−{amount}",
    saveLong: "توفرين {amount}",
    inStock: "متوفر — يُرسل خلال 24 ساعة",
    lowStock: "بقي {count} أزواج فقط",
    outOfStock: "نفذ حالياً",
    color: "اللون",
    size: "المقاس (EU)",
    soldOut: "نفذ",
    sizeGuide: "دليل المقاسات",
    quantity: "الكمية",
    addToCart: "أضيفي إلى السلة",
    added: "تمت الإضافة!",
    orderNow: "اطلبي الآن",
    chooseSize: "اختاري مقاسك للمتابعة.",
    specsTitle: "المواصفات",
    specs: {
      material: "الخامة",
      lining: "البطانة",
      sole: "ارتفاع النعل",
      sizes: "المقاسات",
      colors: "الألوان",
      care: "العناية",
      delivery: "مدة التوصيل",
      price: "الثمن",
      sku: "المرجع",
    },
    deliveryValue: `${h.min} إلى ${h.max} ساعة (${d.min} إلى ${d.max} أيام) لجميع مدن المغرب`,
    deliveryTitle: "التوصيل والدفع",
    deliveryText: `توصيل لجميع مدن المغرب خلال ${h.min} إلى ${h.max} ساعة. {shipSentence} الدفع نقداً عند الاستلام، بدون بطاقة بنكية.`,
    exchangeTitle: "تبديل المقاس",
    exchangeText: `المقاس لم يناسبك؟ راسلينا على واتساب خلال ${S.exchangeDays} أيام من الاستلام، ونبدله مجاناً بمقاس آخر (منتج غير مستعمل وفي علبته الأصلية).`,
    faqTitle: "أسئلة حول هذا المنتج",
    faq: [
      {
        q: "أي مقاس أختار؟",
        a: "اختاري مقاسك المعتاد. إذا كنتِ بين مقاسين، اختاري الأكبر لأن البطانة سميكة. دليل المقاسات يوضح طول القدم بالسنتيمتر لكل مقاس.",
      },
      {
        q: "هل يمكن ارتداؤها خارج المنزل؟",
        a: "نعم، للخرجات القصيرة في الطقس الجاف. النعل بارتفاع 5 سم مانع للانزلاق، لكن الجلد السويدي لا يحب الماء: تجنبي المطر والبرك.",
      },
      {
        q: "كيف أعتني بها؟",
        a: "نظفي الجلد السويدي بفرشاة ناعمة وهو جاف، واستعملي بخاخاً عازلاً للماء. لا تغسليها في الغسالة. دليل العناية يشرح كل الخطوات.",
      },
      {
        q: "متى يصلني الطلب؟",
        a: `خلال ${h.min} إلى ${h.max} ساعة في جميع أنحاء المغرب. نتصل بك أو نراسلك على واتساب للتأكيد قبل الإرسال.`,
      },
    ],
    alsoLike: "قد يعجبك أيضاً",
    otherColors: "ألوان أخرى",
    colorsCount: "{count} ألوان",
    colorSoldOut: "{name} — نفذ",
    fromPrice: "ابتداءً من {price}",
  },
  shop: {
    title: "المتجر",
    intro: "جميع أحذيتنا، مع التوصيل لكل المغرب والدفع عند الاستلام.",
    all: "الكل",
    categories: "الأصناف",
    tone: "اللون",
    tones: { all: "الكل", brown: "بني", pastel: "فاتح", dark: "داكن", other: "أخرى" },
    sort: "الترتيب",
    sorts: { popular: "الأكثر طلباً", "price-asc": "الثمن: من الأقل", "price-desc": "الثمن: من الأعلى" },
    count: "{count} موديل",
    empty: "لا يوجد موديل يطابق هذه الاختيارات.",
    reset: "عرض كل الموديلات",
    filters: "التصفية",
    relatedGuides: "دلائل مفيدة",
  },
  cart: {
    title: "سلتك",
    empty: "سلتك فارغة.",
    emptyCta: "اكتشفي المتجر",
    subtotal: "المجموع الفرعي",
    shipping: "التوصيل",
    free: "مجاني",
    total: "المجموع",
    leftForFree: "بقي {amount} للحصول على توصيل مجاني",
    freeReached: "رائع، التوصيل مجاني!",
    freeEverywhere: "توصيل مجاني لجميع مدن المغرب",
    checkout: "اطلبي — الدفع عند الاستلام",
    continue: "متابعة التسوق",
    sizeLabel: "المقاس {size}",
    remove: "حذف",
  },
  checkout: {
    title: "إتمام الطلب",
    intro: "الدفع عند الاستلام فقط. نتصل بك لتأكيد الطلب قبل الإرسال.",
    contact: "معلوماتك",
    name: "الاسم الكامل",
    namePh: "مثال: سلمى بنعلي",
    phone: "رقم الهاتف",
    phonePh: "06 12 34 56 78",
    phoneHelp: "رقم مغربي: 06 أو 07 أو 05 + 8 أرقام، أو ‎+212.",
    city: "المدينة",
    cityPh: "اختاري مدينتك",
    address: "عنوان التوصيل",
    addressPh: "الحي، الشارع، الرقم، الطابق…",
    note: "ملاحظة (اختياري)",
    notePh: "مثال: الاتصال قبل القدوم",
    summary: "ملخص الطلب",
    submit: "تأكيد الطلب",
    submitting: "جارٍ الإرسال…",
    cod: "تدفعين نقداً لعامل التوصيل عند الاستلام.",
    emptyCart: "سلتك فارغة.",
    backToShop: "العودة إلى المتجر",
    secure: "معلوماتك تُستعمل فقط لتوصيل طلبك.",
    errors: {
      name: "اكتبي اسمك الكامل (حرفان على الأقل).",
      phone: "رقم غير صحيح: 06 أو 07 أو 05 متبوعاً بـ 8 أرقام (أو ‎+212).",
      city: "اختاري مدينتك.",
      address: "اكتبي عنواناً كاملاً (8 أحرف على الأقل).",
      cart: "سلتك فارغة أو تحتوي على منتج غير صالح.",
      stock: "الكمية غير متوفرة: {items}. عدّلي السلة ثم أعيدي المحاولة.",
      productGone: "منتج لم يعد متوفراً: {items}.",
      generic: "حدث خطأ. أعيدي المحاولة أو اطلبي عبر واتساب.",
      rate: "محاولات كثيرة. أعيدي المحاولة بعد بضع دقائق.",
    },
  },
  thanks: {
    title: "شكراً، تم تسجيل طلبك!",
    ref: "رقم الطلب",
    text: `سنتصل بك قريباً للتأكيد. التوصيل خلال ${h.min}–${h.max} ساعة، والدفع عند الاستلام: {total}.`,
    whatsapp: "أرسلي طلبي عبر واتساب",
    whatsappHelp: "لتأكيد أسرع.",
    back: "العودة إلى المتجر",
    waMessage: "السلام عليكم Naalora، لقد أرسلت الطلب {ref} ({total}).\n{items}\nالاسم: {name}\nالمدينة: {city}",
  },
  guides: {
    title: "دلائل ونصائح",
    intro: "نصائحنا لاختيار المقاس المناسب، والعناية بأحذيتك، واختيار الموديل المناسب لك.",
    readMore: "اقرئي الدليل",
    author: "فريق Naalora",
    by: "بقلم",
    updated: "آخر تحديث: {date}",
    empty: "الدلائل الأولى ستصل قريباً.",
    shopCta: "عرض البلغات",
    related: "دلائل أخرى",
  },
  sizeGuide: {
    title: "دليل المقاسات",
    intro: "مقاساتنا من 36 إلى 41 (مقاسات أوروبية). قيسي قدمك وقارني مع الجدول أسفله.",
    tableCaption: "المقاس الأوروبي مقابل طول القدم",
    colSize: "المقاس (EU)",
    colCm: "طول القدم",
    howTitle: "كيف تقيسين قدمك",
    steps: [
      "ضعي ورقة على الأرض بمحاذاة الحائط.",
      "قفي واجعلي الكعب ملتصقاً بالحائط مع توزيع الوزن جيداً.",
      "ضعي علامة عند طرف أطول إصبع، ثم قيسي بالسنتيمتر.",
      "قيسي القدمين معاً واحتفظي بالقياس الأكبر.",
    ],
    tip: "بين مقاسين؟ اختاري المقاس الأكبر لأن البطانة سميكة.",
    exchange: `وإذا لم يناسبك المقاس، فالتبديل مجاني خلال ${S.exchangeDays} أيام.`,
    cm: "{cm} سم",
  },
  faq: {
    title: "أسئلة شائعة",
    intro: "الدفع، التوصيل، المقاسات والعناية: أجوبة أسئلتك.",
    updated: "آخر تحديث: {date}",
    more: "عندك سؤال آخر؟",
    moreText: "راسلينا على واتساب، نجيب بسرعة.",
    items: [
      {
        q: "كيف يعمل الدفع عند الاستلام؟",
        a: "تدفعين نقداً لعامل التوصيل عند استلام الطرد. لا نطلب أي بطاقة بنكية: ترسلين الطلب من الموقع، نتصل بك للتأكيد، ثم يسلمك عامل التوصيل الطرد مقابل المبلغ المعروض (مع ثمن التوصيل).",
      },
      {
        q: "ما هي طرق الدفع؟",
        a: "الدفع يكون نقداً عند الاستلام فقط. الدفع بالبطاقة عبر الإنترنت غير متوفر حالياً.",
      },
      {
        q: "ما هي مدة التوصيل؟",
        a: `يستغرق التوصيل من ${h.min} إلى ${h.max} ساعة (${d.min} إلى ${d.max} أيام) لجميع مدن المغرب. الطلبات المؤكدة تُرسل في نفس اليوم أو اليوم الموالي من الدار البيضاء.`,
      },
      {
        q: "كم ثمن التوصيل؟",
        a: "{shipFaq}",
      },
      {
        q: "هل توصلون لجميع مدن المغرب؟",
        a: "نعم، نوصل لجميع المدن المغربية: الدار البيضاء، الرباط، مراكش، فاس، طنجة، أكادير وكل المدن الأخرى.",
      },
      {
        q: "هل يمكنني تبديل المقاس؟",
        a: `نعم، تبديل المقاس مجاني خلال ${S.exchangeDays} أيام من الاستلام. راسلينا على واتساب برقم الطلب؛ يجب أن يكون المنتج غير مستعمل وفي علبته الأصلية.`,
      },
      {
        q: "كيف أختار مقاسي؟",
        a: "اختاري مقاسك المعتاد، وإذا كنتِ بين مقاسين فاختاري الأكبر. دليل المقاسات يوضح طول القدم لكل مقاس: 36 = 22.5 سم، 37 = 23.5 سم، 38 = 24 سم، 39 = 25 سم، 40 = 25.5 سم، 41 = 26.5 سم.",
      },
      {
        q: "كيف أعتني ببلغة من الجلد السويدي؟",
        a: "نظفي الجلد السويدي بفرشاة ناعمة وهو جاف، واحميه ببخاخ عازل للماء. لا تغسلي البلغة في الغسالة أبداً؛ وفي حالة وجود بقعة، اتركيها تجف ثم نظفيها بالفرشاة بلطف.",
      },
      {
        q: "أين أشتري بلغات بنعل مرتفع في المغرب؟",
        a: `يمكنك شراء بلغات بنعل مرتفع من الجلد السويدي على naalora.com، مع التوصيل لجميع مدن المغرب خلال ${h.min}–${h.max} ساعة والدفع عند الاستلام. Naalora مقرها الدار البيضاء وتقدم 6 ألوان، من 36 إلى 41.`,
      },
      {
        q: "كيف أتابع أو أعدّل طلبي؟",
        a: `راسلينا على واتساب (${phone}) برقم الطلب. ما دام الطلب لم يُرسل بعد، يمكننا تغيير المقاس أو اللون أو العنوان.`,
      },
    ],
  },
  about: {
    title: "من نحن",
    lead: "Naalora متجر أحذية إلكتروني مقره الدار البيضاء. بدأنا بما نحب ارتداءه في المنزل: بلغات بنعل مرتفع من الجلد السويدي، دافئة ومريحة.",
    sections: [
      {
        title: "من نحن",
        text: "فريق صغير في الدار البيضاء يختار كل موديل، ويراقب كل زوج قبل الإرسال، ويجيب بنفسه على رسائلك. البلغات أولاً، ثم الأحذية الرياضية والصنادل والأحذية الطويلة لاحقاً.",
      },
      {
        title: "ما يميز بلغاتنا",
        text: "جزء علوي من الجلد السويدي الناعم، بطانة فرو سميكة، حافة مضفورة على شكل متعرج، ونعل مرتفع خفيف ومانع للانزلاق بارتفاع 5 سم. موديل بسيط بـ 6 ألوان.",
      },
      {
        title: "التوصيل والدفع",
        text: `توصيل لجميع مدن المغرب خلال ${h.min} إلى ${h.max} ساعة. {shipSentence} الدفع نقداً عند الاستلام.`,
      },
      {
        title: "تبديل المقاس",
        text: `تبديل المقاس مجاناً خلال ${S.exchangeDays} أيام من الاستلام، لمنتج غير مستعمل وفي علبته الأصلية.`,
      },
    ],
    contactTitle: "تواصلي معنا",
    contactText: "الأسرع: واتساب. نجيب طيلة أيام الأسبوع.",
    whatsapp: "واتساب",
    email: "البريد الإلكتروني",
    city: "المدينة",
  },
  footer: {
    tagline: "أحذية مريحة، تصلك لكل مدن المغرب. الدفع عند الاستلام.",
    shop: "المتجر",
    help: "المساعدة",
    company: "Naalora",
    contact: "اتصل بنا",
    allProducts: "كل المنتجات",
    rights: "جميع الحقوق محفوظة.",
    city: `مقرنا ${S.city.ar}، المغرب`,
  },
  notFound: {
    title: "عذراً، هذه الصفحة غير موجودة.",
    text: "الصفحة التي تبحثين عنها غير موجودة أو تم نقلها.",
    shop: "عرض المتجر",
    home: "العودة إلى الرئيسية",
  },
  cities: [
    "الدار البيضاء", "الرباط", "مراكش", "فاس", "طنجة", "أكادير", "مكناس", "وجدة", "القنيطرة", "تطوان",
    "سلا", "تمارة", "المحمدية", "الجديدة", "آسفي", "بني ملال", "الناظور", "خريبكة", "سطات",
    "العيون", "الصويرة", "ورزازات", "أخرى",
  ],
  orderConfirmMessage: `السلام عليكم {name}، معك Naalora 👋\nنؤكد طلبك {ref}:\n{items}\nالمجموع: {total} (الدفع عند الاستلام).\nالتوصيل إلى {city} خلال ${h.min}–${h.max} ساعة. شكراً لثقتك!`,
  breadcrumbHome: "الرئيسية",
};

const dictionaries: Record<Locale, Dictionary> = { fr, ar };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/**
 * Delivery wording, built from the admin settings (free / fee / fee with free threshold).
 * Fills the {shipShort}, {shipSentence} and {shipFaq} placeholders of the dictionary.
 */
export function shippingTexts(lang: Locale, s: ShippingSettings): Record<"shipShort" | "shipSentence" | "shipFaq", string> {
  const fee = formatPrice(s.fee, lang);
  const free = s.freeFrom ? formatPrice(s.freeFrom, lang) : "";
  if (lang === "ar") {
    if (isFreeShipping(s)) return { shipShort: "توصيل مجاني", shipSentence: "التوصيل مجاني.", shipFaq: "التوصيل مجاني لجميع مدن المغرب مهما كان مبلغ الطلب." };
    if (hasFreeThreshold(s))
      return { shipShort: `الثمن ${fee} (مجاني ابتداءً من ${free})`, shipSentence: `ثمن التوصيل ${fee}، ومجاني ابتداءً من ${free}.`, shipFaq: `ثمن التوصيل ${fee}، وهو مجاني ابتداءً من ${free}. المبلغ النهائي يظهر في السلة قبل الطلب.` };
    return { shipShort: `الثمن ${fee}`, shipSentence: `ثمن التوصيل ${fee}.`, shipFaq: `ثمن التوصيل ${fee} لجميع مدن المغرب. المبلغ النهائي يظهر في السلة قبل الطلب.` };
  }
  if (isFreeShipping(s)) return { shipShort: "livraison gratuite", shipSentence: "Livraison gratuite.", shipFaq: "La livraison est gratuite partout au Maroc, quel que soit le montant de la commande." };
  if (hasFreeThreshold(s))
    return { shipShort: `frais ${fee} (offerts dès ${free})`, shipSentence: `Frais : ${fee}, offerts dès ${free} d’achat.`, shipFaq: `La livraison coûte ${fee} et elle est offerte dès ${free} d’achat. Le montant exact est affiché dans le panier avant de commander.` };
  return { shipShort: `frais ${fee}`, shipSentence: `Frais : ${fee}.`, shipFaq: `La livraison coûte ${fee} partout au Maroc. Le montant exact est affiché dans le panier avant de commander.` };
}

function fillDeep<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === "string") return value.replace(/\{(shipShort|shipSentence|shipFaq)\}/g, (_, k: string) => vars[k]) as T;
  if (Array.isArray(value)) return value.map((v) => fillDeep(v, vars)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fillDeep(v, vars)])) as T;
  return value;
}

/** Dictionary with the current delivery price filled in. Use it wherever delivery texts are shown. */
export async function getDictionaryLive(lang: Locale): Promise<Dictionary> {
  const shipping = await getShippingSettings();
  return fillDeep(dictionaries[lang], shippingTexts(lang, shipping));
}

/** City options: value is always the French name (stored in orders), label is localized. */
export function cityOptions(lang: Locale): { value: string; label: string }[] {
  return fr.cities.map((value, i) => ({ value, label: dictionaries[lang].cities[i] }));
}

export const CITY_VALUES: readonly string[] = fr.cities;
