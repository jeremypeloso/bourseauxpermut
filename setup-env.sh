#!/usr/bin/env bash
# Hors Boîte — prépare .env.local dans le Codespace, génère les secrets,
# ouvre le port 3000 en public et affiche l'URL à déclarer dans Supabase.
# Usage : bash setup-env.sh
set -e

cd "$(dirname "$0")"

ask() { # ask VAR "question" [défaut]
  local var="$1" q="$2" def="${3:-}" val
  if [ -n "$def" ]; then read -r -p "$q [$def] : " val; val="${val:-$def}"; else read -r -p "$q : " val; fi
  printf -v "$var" '%s' "$val"
}

echo "== Hors Boîte : configuration locale =="
echo

ask SUPA_URL  "URL Supabase (Project settings > API)"
ask SUPA_ANON "Clé anon Supabase"
ask SUPA_SRV  "Clé service_role Supabase"
ask RESEND    "Clé API Resend (re_...)" "re_a_remplir"
ask STRIPE_SK "Clé secrète Stripe (sk_test_...)" "sk_test_a_remplir"
ask STRIPE_PR "Price ID Stripe (price_...)" "price_a_remplir"

# URL publique du Codespace sur le port 3000
if [ -n "$CODESPACE_NAME" ] && [ -n "$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN" ]; then
  SITE_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
  SITE_URL="http://localhost:3000"
fi

# Secrets : on ne les régénère pas s'ils existent déjà (sinon les identités chiffrées seraient perdues)
if [ -f .env.local ] && grep -q '^IDENTITIES_KEY=.\+' .env.local; then
  IDK=$(grep '^IDENTITIES_KEY=' .env.local | cut -d= -f2)
  PEP=$(grep '^MATRICULE_PEPPER=' .env.local | cut -d= -f2)
  CRON=$(grep '^CRON_SECRET=' .env.local | cut -d= -f2)
  echo "Secrets existants conservés."
else
  IDK=$(openssl rand -hex 32); PEP=$(openssl rand -hex 32); CRON=$(openssl rand -hex 32)
  echo "Secrets générés."
fi

cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPA_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPA_ANON}
SUPABASE_SERVICE_ROLE_KEY=${SUPA_SRV}

IDENTITIES_KEY=${IDK}
MATRICULE_PEPPER=${PEP}
CRON_SECRET=${CRON}

RESEND_API_KEY=${RESEND}
EMAIL_FROM="Hors Boîte <onboarding@resend.dev>"

STRIPE_SECRET_KEY=${STRIPE_SK}
STRIPE_WEBHOOK_SECRET=whsec_a_remplir
STRIPE_PRICE_ID=${STRIPE_PR}

NEXT_PUBLIC_SITE_URL=${SITE_URL}
EOF

grep -q '^.env.local$' .gitignore 2>/dev/null || echo ".env.local" >> .gitignore

# Port 3000 public (nécessaire pour le retour du lien magique)
if command -v gh >/dev/null && [ -n "$CODESPACE_NAME" ]; then
  gh codespace ports visibility 3000:public -c "$CODESPACE_NAME" >/dev/null 2>&1 && echo "Port 3000 passé en public." || echo "Port 3000 : passe-le en public à la main (onglet Ports > clic droit > Visibilité)."
fi

echo
echo "== .env.local écrit =="
echo
echo "À faire maintenant dans Supabase > Authentication > URL Configuration :"
echo "  Site URL      : ${SITE_URL}"
echo "  Redirect URLs : ${SITE_URL}/auth/callback"
echo
echo "IMPORTANT : sauvegarde ces trois secrets ailleurs (gestionnaire de mots de passe)."
echo "  IDENTITIES_KEY   = ${IDK}"
echo "  MATRICULE_PEPPER = ${PEP}"
echo "  CRON_SECRET      = ${CRON}"
echo
echo "Puis : npm run dev  →  ${SITE_URL}/login"
