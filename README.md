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

Pour tester avec de vraies photos sans base de données, placez des images JPG dans `public/test-photos/` (dossier ignoré par Git) puis lancez :

```bash
NAALORA_TEST_CATALOG=1 npm run dev
```

La liste des produits de test et les noms de fichiers attendus sont dans `src/lib/test-catalog.ts`. Ce mode n’existe qu’en mode démo.

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

Le script crée la catégorie « Pantoufles », les 6 pantoufles (tailles 36–41, stock 10) et 3 guides **en brouillon** (à relire puis publier dans l’admin), et crée les index. Il n’ajoute que ce qui manque : vos modifications ne sont jamais écrasées. Pour réinitialiser les éléments d’exemple :

```bash
npm run seed -- --force
```

Les commandes utilisent une **transaction** MongoDB (stock vérifié et décrémenté de façon atomique) : Atlas le permet, y compris en M0.

## 2. Cloudinary (images)

1. Créez un compte gratuit sur https://cloudinary.com.
2. Dans le *Dashboard* : copiez **Cloud name**, **API Key**, **API Secret** dans les variables `CLOUDINARY_*`.
3. C’est tout : l’admin envoie les images directement à Cloudinary avec une **signature générée côté serveur** (dossiers `naalora/products` et `naalora/guides`). Une image supprimée dans l’admin est aussi supprimée de Cloudinary.

Les images sont affichées avec `next/image` et transformées par Cloudinary (`f_auto,q_auto`, largeur adaptée) — voir `src/lib/image-loader.ts`. Tant que vous n’avez pas ajouté de photos, des illustrations de remplacement (`public/placeholders`) sont utilisées.

## 3. Déploiement sur Vercel

1. Poussez le dépôt sur GitHub, puis sur https://vercel.com → *Add New Project* → importez le dépôt.
2. *Settings → Environment Variables* : ajoutez toutes les variables ci-dessus (Production + Preview).
3. Déployez. Ajoutez ensuite votre domaine `naalora.com` (*Settings → Domains*) et mettez `NEXT_PUBLIC_SITE_URL=https://naalora.com`.

Les pages sont générées statiquement et revalidées : toute modification dans l’admin (produits, catégories, guides) met à jour le site immédiatement.

## Administration (`/admin`, en français)

- **Commandes** : statistiques, filtre par statut, détail, bouton WhatsApp avec message de confirmation pré-rempli (dans la langue du client), appel, changement de statut. Passer une commande en « Annulé » remet les articles en stock.
- **Produits** : créer, modifier, activer/désactiver, images (ajout, ordre, suppression, texte alternatif FR/AR), tailles + stock, caractéristiques, résumé.
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
