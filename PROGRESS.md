# Naalora — avancement

Dernière mise à jour : 17 novembre 2026 (code complet sur GitHub, build vérifié depuis une installation propre). Voir `README.md` pour l’installation.

## Fait

Toutes les sections du cahier des charges sont codées. Chaque étape passe `npm run build` et `npx eslint src`, et a été vérifiée sur mobile, en français et en arabe (RTL).

1. **Installation** — Next.js 16, Tailwind 4, couleurs et polices de la marque, logos SVG, `.env.example`.
2. **Langues** — `/fr` et `/ar`, redirection de `/` (cookie `lang` puis langue du navigateur), RTL complet, tous les textes dans `src/lib/i18n.ts`, prix « 349 MAD » / « 349 درهم », page 404 bilingue.
3. **Base de données** — modèles Mongoose (Category, Product, Order, Guide) avec index, connexion en cache, `npm run seed`, mode démo en mémoire sans `MONGODB_URI`, images de remplacement.
4. **Mise en page** — en-tête flottant, menu mobile, sélecteur FR | ع, panier latéral (à gauche en arabe), pied de page sombre, bouton WhatsApp flottant.
5. **Boutique** — accueil, boutique et catégories (filtre par teinte, tri par prix), fiche produit (galerie, tailles épuisées désactivées, caractéristiques, FAQ, produits similaires).
6. **Contenus** — guides en Markdown rendus côté serveur, guide des tailles, FAQ, À propos (Casablanca).
7. **Commande** — paiement à la livraison, validation côté serveur, prix lus en base, stock décrémenté dans une transaction, écran de remerciement avec WhatsApp.
8. **Admin** — connexion par cookie signé ; onglets Commandes, Produits (images Cloudinary), Catégories et Guides. Le site se met à jour immédiatement après chaque modification.
9. **SEO** — titres et descriptions, canonical, hreflang fr-MA / ar-MA / x-default, images de partage générées, JSON-LD, sitemap, robots, noindex, flux Google Merchant (`/feed/google.xml`).
10. **Recherche IA** — robots IA autorisés, `/llms.txt`, faits centralisés dans `src/lib/site.ts`.
11. **README** — MongoDB Atlas, Cloudinary, variables d’environnement, seed, déploiement Vercel.

## Ajouté depuis

- **Champ « Modèle » sur les produits** : les produits qui partagent le même code de modèle s’affichent comme couleurs l’un de l’autre (pastilles, ligne « Couleurs », couleurs de l’accueil). Vide = toute la catégorie (compatible avec les données existantes).
- **Catalogue de test avec de vraies photos** (mode démo uniquement, `NAALORA_TEST_CATALOG=1`) : photos fournisseur recadrées en 4:5 dans `public/test-photos/` (**exclu de Git, jamais déployé**). Il ajoute une catégorie « Bottes & bottines » (902 ×3 couleurs, 911, 948), la pantoufle JR-26 (×3 couleurs) et remplace les illustrations des 6 pantoufles plateforme. Les prix des nouveaux modèles sont provisoires.
- ⚠️ **À ne pas publier tel quel** : les pantoufles plateforme portent le logo **UGG** et la botte 948 imite le motif « Oblique » de Dior. Vendre ou photographier des articles portant la marque d’un autre est de la contrefaçon (et interdit par Google Merchant Center). Avant la mise en ligne : stock sans logo et photos propres.

- **Mode clair / sombre** : bouton soleil/lune dans l’en-tête (à la place de l’icône WhatsApp). Le choix est gardé dans le navigateur ; sinon le réglage du système est suivi. Aucun flash au chargement.
- **Icônes WhatsApp retirées** (en-tête, bouton flottant, menu mobile, icônes des liens). Les liens WhatsApp restent en texte (pied de page, FAQ, À propos, page de remerciement, admin).
- **Catalogue de test automatique** : en mode démo, il s’active tout seul si `public/test-photos/` contient les photos (`NAALORA_TEST_CATALOG=0` pour le couper). Le terminal affiche une ligne `[naalora] …` qui dit quel mode est utilisé.

- **Assistant IA (Groq) pour ajouter un produit** : photo et/ou note → fiche FR/AR pré-remplie dans le formulaire. 3 modèles en secours (`qwen/qwen3.8-27b` → `openai/gpt-oss-120b` → `openai/gpt-oss-20b`, configurables par `GROQ_MODELS`). Testé avec la vraie API Groq : création d’un produit avec photo (2,7 s) et bascule automatique quand le 1er modèle est en panne.

## En cours / non vérifié

- **MongoDB réel non testé** : aucun MongoDB n’était disponible pendant le développement. Le seed, la transaction de commande et les écritures de l’admin sur MongoDB n’ont été vérifiés que par TypeScript. Le même parcours a été testé de bout en bout en mode démo.
- **Envoi d’images Cloudinary non testé** (pas de clés pendant le développement).
- **Lighthouse non lancé** (à faire avec PageSpeed Insights après la mise en ligne).
- **Textes à relire par le propriétaire** :
  - « Nous répondons 7j/7 » ;
  - expédition « le jour même ou le lendemain depuis Casablanca » ;
  - conditions d’échange : article non porté, emballage d’origine ;
  - le texte arabe s’adresse aux femmes (formes féminines) : à confirmer.
- **Photos** : les 6 produits utilisent encore des illustrations de remplacement ; les 3 guides sont en brouillon.

## Prochaines étapes

1. Créer le cluster MongoDB Atlas M0, renseigner `MONGODB_URI` dans `.env.local`, puis lancer `npm run seed`.
2. Créer le compte Cloudinary et renseigner les 3 variables `CLOUDINARY_*`.
3. **Vercel : à faire plus tard, dans un autre compte Vercel** (décision du propriétaire — ne pas utiliser le compte Vercel actuellement connecté). Importer le dépôt GitHub `Med-Himri/naalora` et déployer avec toutes les variables (dont un `ADMIN_PASSWORD` fort et le vrai `NEXT_PUBLIC_WHATSAPP_NUMBER`), puis connecter naalora.com.
4. Tester en réel : une commande, son annulation (le stock doit revenir) et l’envoi d’une photo.
5. Dans l’admin : ajouter les vraies photos (portrait 4:5), relire puis publier les guides, corriger les textes ci-dessus si besoin.
6. Après la mise en ligne :
   - Search Console : valider naalora.com et envoyer le sitemap ;
   - Merchant Center : connecter le flux ;
   - créer la fiche Google Business Profile ;
   - vérifier les pages avec le Rich Results Test ;
   - mesurer avec PageSpeed Insights (objectif ≥ 90 sur mobile).

## Notes techniques

- Next.js 16 est utilisé **sans** `cacheComponents` : pages pré-générées + `revalidate`, invalidées par tag (`catalog`, `guides`) depuis l’admin.
- Une page qui appelle `notFound()` (par ex. produit supprimé) renvoie bien un statut 404, mais son contenu ne s’affiche qu’avec JavaScript (comportement de Next 16.4). Les URL inconnues affichent la 404 bilingue en HTML complet.
- Les images de partage des pages arabes n’ont pas de texte : le générateur d’images ne sait pas dessiner l’arabe.
