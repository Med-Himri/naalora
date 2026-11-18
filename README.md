# Naalora — boutique de chaussures au Maroc

Next.js 16 (App Router, Server Components, Server Actions) · Tailwind CSS 4 · MongoDB Atlas (Mongoose) · Cloudinary · Vercel.
Français (`/fr`, par défaut) et arabe (`/ar`, RTL). Paiement à la livraison.

## Démarrage rapide (sans base de données)

Prérequis : Node.js **22.18 ou plus récent** (le script de seed utilise le support TypeScript intégré à Node).

```bash
npm install
```

```bash
npm run dev
```

Ouvrez http://localhost:3000. Sans `MONGODB_URI`, le site tourne en **mode démo** : catalogue, guides et commandes sont en mémoire (perdus au redémarrage). L’admin est sur http://localhost:3000/admin — mot de passe `admin` en développement.

### Catalogue de test (photos locales)

Pour tester avec de vraies photos sans base de données, placez les images JPG dans `public/test-photos/` (dossier ignoré par Git) puis lancez `npm run dev` : le catalogue de test s’active tout seul. Le terminal affiche une ligne `[naalora] …` qui confirme le mode utilisé.

Ce mode n’existe que **sans** `MONGODB_URI`. Pour le couper : `NAALORA_TEST_CATALOG=0` dans `.env.local`. La liste des produits de test et les noms de fichiers attendus sont dans `src/lib/test-catalog.ts`.

## Variables d’environnement

Copiez `.env.example` en `.env.local` et remplissez :

| Variable | Rôle | Secret ? |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publique (`https://naalora.com`) — canonical, sitemap, JSON-LD | non |
| `MONGODB_URI` | Chaîne de connexion MongoDB Atlas | **oui** |
| `MONGODB_DB` | Nom de la base (`naalora`) | non |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary | non |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | non |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | **oui** |
| `ADMIN_PASSWORD` | Mot de passe de `/admin` (obligatoire en production, sinon l’admin est désactivé) | **oui** |
| `GROQ_API_KEY` | Clé API Groq pour l’assistant IA de l’admin (facultatif) | **oui** |
| `GROQ_MODELS` | Facultatif : modèles essayés dans l’ordre, séparés par des virgules | non |
| `GROQ_VISION_MODELS` | Facultatif : lesquels de ces modèles savent lire une photo | non |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Numéro WhatsApp au format international sans `+` (`2126XXXXXXXX`) | non |
| `NEXT_PUBLIC_CONTACT_EMAIL` | E-mail affiché sur le site | non |

Les secrets ne sont lus que côté serveur (jamais dans le code client ni dans une variable `NEXT_PUBLIC_`).

## 1. MongoDB Atlas (gratuit, M0)

1. Créez un compte sur https://cloud.mongodb.com et un cluster **M0 (Free)** — région proche (ex. Europe/Paris ou Frankfurt).
2. **Database Access** → *Add New Database User* : utilisateur + mot de passe fort, rôle *Read and write to any database*.
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (nécessaire pour Vercel, dont les IP changent).
4. **Connect → Drivers** : copiez la chaîne `mongodb+srv://…` dans `MONGODB_URI` (remplacez `<password>`).
5. Remplissez la base :

```bash
npm run seed
```

Le script crée la catégorie « Pantoufles », le produit « Pantoufle plateforme » en **6 couleurs** (tailles 36–41, stock 10 par taille) et 3 guides **en brouillon** (à relire puis publier dans l’admin), et crée les index. Il n’ajoute que ce qui manque : vos modifications ne sont jamais écrasées. Pour réinitialiser les éléments d’exemple :

```bash
npm run seed -- --force
```

**Base créée avant les couleurs ?** (un produit par couleur, ex. `pantoufle-plateforme-chocolat`, `…-camel`…) — lancez une fois :

```bash
npm run migrate
```

Les produits qui partagent le même code modèle sont fusionnés en **un produit avec plusieurs couleurs** (stock, photos et prix conservés) ; les autres deviennent des produits à une couleur. `npm run seed` le fait aussi automatiquement.

Les commandes utilisent une **transaction** MongoDB (stock vérifié et décrémenté de façon atomique) : Atlas le permet, y compris en M0.

## 2. Cloudinary (images)

1. Créez un compte gratuit sur https://cloudinary.com.
2. Dans le *Dashboard* : copiez **Cloud name**, **API Key**, **API Secret** dans les variables `CLOUDINARY_*`.
3. C’est tout : l’admin envoie les images directement à Cloudinary avec une **signature générée côté serveur** (dossiers `naalora/products` et `naalora/guides`). Une image supprimée dans l’admin est aussi supprimée de Cloudinary.

Les images sont affichées avec `next/image` et transformées par Cloudinary (`f_auto,q_auto`, largeur adaptée) — voir `src/lib/image-loader.ts`. Tant que vous n’avez pas ajouté de photos, des illustrations de remplacement (`public/placeholders`) sont utilisées.

## Assistant IA (Groq) — ajouter un produit

Dans **Admin → Produits → Nouveau produit**, l’« Assistant IA » remplit la fiche à partir d’une photo et/ou d’une note (nom, slug, modèle, couleur, teinte, résumé, description, caractéristiques, texte alternatif — en français et en arabe). Vous vérifiez, indiquez le prix et le stock, puis enregistrez. Le prix et le stock ne sont jamais inventés, et l’IA a pour consigne de ne jamais écrire de nom de marque.

1. Créez une clé sur https://console.groq.com/keys et mettez-la dans `GROQ_API_KEY` (`.env.local` et Vercel).
2. Par défaut, 3 modèles sont essayés dans l’ordre : `qwen/qwen3.8-27b` (lit les photos), puis `openai/gpt-oss-120b`, puis `openai/gpt-oss-20b`. Si un modèle échoue (panne, limite, délai de 30 s, modèle retiré), le suivant prend le relais ; l’écran affiche les essais.
3. Les modèles de secours ne lisent que la note : avec une photo seule, seul le premier fonctionne. Ajoutez toujours une courte note.
4. Quand Groq retire un modèle, changez `GROQ_MODELS` (liste à jour sur https://console.groq.com/docs/models) — pas besoin de toucher au code.

## 3. Déploiement sur Vercel

1. Poussez le dépôt sur GitHub, puis sur https://vercel.com → *Add New Project* → importez le dépôt.
2. *Settings → Environment Variables* : ajoutez toutes les variables ci-dessus (Production + Preview).
3. Déployez. Ajoutez ensuite votre domaine `naalora.com` (*Settings → Domains*) et mettez `NEXT_PUBLIC_SITE_URL=https://naalora.com`.

Les pages sont générées statiquement et revalidées : toute modification dans l’admin (produits, catégories, guides) met à jour le site immédiatement.

## Administration (`/admin`, en français)

- **Commandes** : statistiques, filtre par statut, détail, bouton WhatsApp avec message de confirmation pré-rempli (dans la langue du client), appel, changement de statut. Passer une commande en « Annulé » remet les articles en stock.
- **Produits** : créer, modifier, activer/désactiver, supprimer. Un produit a **plusieurs couleurs** : chaque couleur a son nom FR/AR, sa pastille, sa teinte, un prix facultatif (sinon celui du produit), ses tailles + stock et ses photos (ajout, ordre, suppression, texte alternatif FR/AR, 12 max par couleur). Le client choisit la couleur sur la fiche (`?couleur=…` dans l’URL).
- **Catégories** : créer, modifier (intro FR/AR), réordonner.
- **Guides** : créer, modifier (Markdown FR/AR), image de couverture, publier/dépublier.

## SEO & recherche IA

- Métadonnées FR/AR, canonical, hreflang `fr-MA` / `ar-MA` / `x-default`, Open Graph + Twitter (images générées sur `/og/...`).
- `sitemap.xml`, `robots.txt` (robots IA autorisés, `/admin`, `/commande`, `/api` exclus), `noindex` sur commande, admin et URLs filtrées.
- JSON-LD : Organization, WebSite, Product (offre MAD, stock, livraison, politique d’échange), BreadcrumbList, FAQPage, Article.
- Flux Google Merchant Center : `/feed/google.xml`. Résumé pour les assistants IA : `/llms.txt`.
- Les faits (prix de livraison, délais, échange, WhatsApp, ville) sont centralisés dans `src/lib/site.ts` et `src/lib/pricing.ts` : changez-les là, ils se mettent à jour partout.

## Structure

```
src/app/[lang]/          pages boutique (FR/AR)
src/app/admin/           administration + server actions
src/app/og, feed, llms.txt, sitemap.ts, robots.ts
src/components/          header, panier, produit, admin…
src/lib/i18n.ts          tous les textes FR + AR
src/lib/site.ts          faits de l’entreprise (source unique)
src/lib/data.ts          lectures (cache + revalidation)
src/lib/orders.ts        création de commande (transaction, stock)
src/models/              modèles Mongoose
scripts/seed.ts          npm run seed
```

## Commandes utiles

```bash
npm run build
```

```bash
npx eslint src
```
