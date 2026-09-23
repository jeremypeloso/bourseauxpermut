# La Bourse aux permut'

Permutation de postes, écoute anonyme et préparation de l'après pour policiers, gendarmes et personnels pénitentiaires.
Next.js 14 (App Router) · Supabase (Auth, Postgres, RLS) · Vercel (hébergement, cron) · Resend (mails) · Stripe (abonnement 9,99 €/mois).

## 1. GitHub
```bash
git init && git add -A && git commit -m "init La Bourse aux permut'"
gh repo create labourseauxpermut --private --source=. --push   # ou créer le repo sur github.com puis git remote add origin … && git push -u origin main
```

## 2. Supabase
1. Créer un projet (région **Frankfurt** ou **Paris**, pour rester en UE).
2. SQL Editor → exécuter dans l'ordre `0001` à `0005` (dossier `supabase/migrations`).
3. Authentication → Providers → Email : activer, **désactiver "Confirm email"** n'est pas nécessaire (on utilise le lien magique), mettre le **Site URL** sur `https://labourseauxpermut.fr` et ajouter `https://labourseauxpermut.fr/auth/callback` et `http://localhost:3000/auth/callback` dans Redirect URLs.
4. Authentication → Email Templates → "Magic Link" : sujet neutre, par exemple `Votre lien de connexion`, sans mention de mutation.
5. Project settings → API : copier URL, anon key, service_role key.

## 3. Resend
1. Ajouter le domaine `labourseauxpermut.fr`, créer les enregistrements DNS (DKIM, SPF, DMARC) chez le registrar.
2. Créer une clé API. Expéditeur : `La Bourse aux permut' <noreply@labourseauxpermut.fr>`.
3. Optionnel mais recommandé : dans Supabase → Authentication → SMTP, utiliser Resend en SMTP (`smtp.resend.com`, port 465, user `resend`, password = clé API) pour que les liens magiques partent aussi de labourseauxpermut.fr.

## 4. Stripe
1. Produit "La Bourse aux permut' Premium", prix récurrent **9,99 € / mois**, copier le `price_…` → `STRIPE_PRICE_ID`.
   Produit "Mise en avant 7 jours", prix unique **4,99 €** → `STRIPE_BOOST_PRICE_ID`.
2. Developers → Webhooks → endpoint `https://labourseauxpermut.fr/api/stripe/webhook`, événements : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `checkout.session.completed`. Copier le `whsec_…`.
3. Settings → Customer portal : activer, pour que la résiliation se fasse en un geste.

## 5. Vercel
```bash
npm i -g vercel
vercel link
# Variables : recopier .env.example dans Settings → Environment Variables (Production + Preview)
vercel env add IDENTITIES_KEY        # openssl rand -hex 32
vercel env add MATRICULE_PEPPER      # openssl rand -hex 32
vercel env add CRON_SECRET           # openssl rand -hex 32
vercel --prod
```
Le cron `/api/cron/matching` (toutes les heures) est déclaré dans `vercel.json` ; Vercel envoie automatiquement l'en-tête `Authorization: Bearer $CRON_SECRET`.
Domaine : ajouter `labourseauxpermut.fr` dans Vercel → Domains, puis les enregistrements DNS indiqués.

## 6. Local
```bash
cp .env.example .env.local   # remplir
npm install
npm run dev
```

## Périmètre v1
Permut' uniquement : annonces anonymes (style petites annonces) + matching intelligent (cycles à 2, 3, 4). Les modules Écoute et L'après sont retirés de l'app (tables conservées en base pour plus tard).

## Structure
- `app/onboarding` : institution → discrétion → carte pro (OCR éphémère) → mail pro (code 7 jours) → récap
- `app/(app)/accueil` : carte de France, fiche du jour, Parler / L'après
- `app/(app)/permut` : correspondances, détail, acceptation, révélation des identités
- `app/(app)/annonces` : annonces anonymes (3 en clair pour les gratuits, en-tête seule pour le reste, tout en Premium), publication gratuite, mise en avant 4,99 € / 7 j, réponse Premium
- `app/(app)/points`, `ecoute`, `apres`, `profil`
- `app/api/verify/*` : vérifications ; `app/api/cron/matching` : détection de cycles ; `app/api/stripe/*` ; `app/api/compte` : suppression totale
- `lib/matching.ts` : graphe et cycles 2 à 4, scoring
- `lib/crypto.ts` : AES-256-GCM pour les identités, sha256 + poivre pour le matricule
- `supabase/migrations/0001_schema.sql` : tables, RLS, vue anonymisée

## Modèle
| | Gratuit | Premium 9,99 € |
|---|---|---|
| Déposer une annonce | oui | oui, mise en avant permanente |
| Voir les annonces | 3 en clair, reste en-tête seule | toutes |
| Répondre à une annonce | non | illimité |
| Matching automatique | alertes à +48 h | alertes immédiates |
| Mise en relation | non | oui |
| Écoute, L'après | tout | tout |

Boost à l'unité : 4,99 € / 7 jours, sans abonnement.

## Ce qui reste pour la v1
- Référentiel complet des services (CSP, CRS, brigades, établissements) : à importer en CSV dans `services`
- Gabarits OCR par institution (`app/api/verify/card/route.ts`, regex à recaler sur de vraies cartes)
- Barème officiel par institution dans `app/(app)/points/page.tsx`
- Messagerie éphémère du module Écoute (Supabase Realtime broadcast, aucune persistance) une fois le partenariat PEPS signé
- Courriers PDF de permutation (génération côté serveur)
- Halos de la carte : vue agrégée `count(*) by departement` sur les profils vérifiés
- Capacitor pour iOS et Android (même schéma que WayPilot)
