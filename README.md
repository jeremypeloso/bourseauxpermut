# Hors Boîte

Permutation de postes, écoute anonyme et préparation de l'après pour policiers, gendarmes et personnels pénitentiaires.
Next.js 14 (App Router) · Supabase (Auth, Postgres, RLS) · Vercel (hébergement, cron) · Resend (mails) · Stripe (abonnement 9,99 €/mois).

## 1. GitHub
```bash
git init && git add -A && git commit -m "init Hors Boîte"
gh repo create horsboite --private --source=. --push   # ou créer le repo sur github.com puis git remote add origin … && git push -u origin main
```

## 2. Supabase
1. Créer un projet (région **Frankfurt** ou **Paris**, pour rester en UE).
2. SQL Editor → coller `supabase/migrations/0001_schema.sql` → Run.
3. Authentication → Providers → Email : activer, **désactiver "Confirm email"** n'est pas nécessaire (on utilise le lien magique), mettre le **Site URL** sur `https://horsboite.fr` et ajouter `https://horsboite.fr/auth/callback` et `http://localhost:3000/auth/callback` dans Redirect URLs.
4. Authentication → Email Templates → "Magic Link" : sujet neutre, par exemple `Votre lien de connexion`, sans mention de mutation.
5. Project settings → API : copier URL, anon key, service_role key.

## 3. Resend
1. Ajouter le domaine `horsboite.fr`, créer les enregistrements DNS (DKIM, SPF, DMARC) chez le registrar.
2. Créer une clé API. Expéditeur : `Hors Boîte <noreply@horsboite.fr>`.
3. Optionnel mais recommandé : dans Supabase → Authentication → SMTP, utiliser Resend en SMTP (`smtp.resend.com`, port 465, user `resend`, password = clé API) pour que les liens magiques partent aussi de horsboite.fr.

## 4. Stripe
1. Produit "Hors Boîte Premium", prix récurrent **9,99 € / mois**, copier le `price_…`.
2. Developers → Webhooks → endpoint `https://horsboite.fr/api/stripe/webhook`, événements : `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copier le `whsec_…`.
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
Domaine : ajouter `horsboite.fr` dans Vercel → Domains, puis les enregistrements DNS indiqués.

## 6. Local
```bash
cp .env.example .env.local   # remplir
npm install
npm run dev
```

## Structure
- `app/onboarding` : institution → discrétion → carte pro (OCR éphémère) → mail pro (code 7 jours) → récap
- `app/(app)/accueil` : carte de France, fiche du jour, Parler / L'après
- `app/(app)/permut` : correspondances, détail, acceptation, révélation des identités
- `app/(app)/points`, `ecoute`, `apres`, `profil`
- `app/api/verify/*` : vérifications ; `app/api/cron/matching` : détection de cycles ; `app/api/stripe/*` ; `app/api/compte` : suppression totale
- `lib/matching.ts` : graphe et cycles 2 à 4, scoring
- `lib/crypto.ts` : AES-256-GCM pour les identités, sha256 + poivre pour le matricule
- `supabase/migrations/0001_schema.sql` : tables, RLS, vue anonymisée

## Ce qui reste pour la v1
- Référentiel complet des services (CSP, CRS, brigades, établissements) : à importer en CSV dans `services`
- Gabarits OCR par institution (`app/api/verify/card/route.ts`, regex à recaler sur de vraies cartes)
- Barème officiel par institution dans `app/(app)/points/page.tsx`
- Messagerie éphémère du module Écoute (Supabase Realtime broadcast, aucune persistance) une fois le partenariat PEPS signé
- Courriers PDF de permutation (génération côté serveur)
- Halos de la carte : vue agrégée `count(*) by departement` sur les profils vérifiés
- Capacitor pour iOS et Android (même schéma que WayPilot)
