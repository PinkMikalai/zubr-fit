# Déploiement sur O2switch

Guide pas à pas pour mettre zubr-fit en ligne sur zubr-fit.com (hébergement mutualisé
O2switch, sans Docker). Backend (Symfony) et frontend (React) sont déployés séparément.

**Structure retenue :**
- `https://zubr-fit.com` → frontend (fichiers statiques React)
- `https://api.zubr-fit.com` → backend (Symfony)

## 0. Prérequis côté cPanel

1. **Sous-domaine API** : crée `api.zubr-fit.com` dans cPanel ("Sous-domaines"), avec pour
   dossier racine `api_zubr_fit` (ou similaire) — **pas** `public_html` directement.
2. **Base de données MySQL** : cPanel → "Bases de données MySQL" → crée une base + un
   utilisateur, attribue tous les privilèges. Note le nom de la base, l'utilisateur et le
   mot de passe : tu en auras besoin dans `.env.prod.local`. phpMyAdmin (déjà inclus dans
   cPanel) permet de la consulter immédiatement.
3. **SSH** : active-le comme vu dans cPanel → "Accès SSH" (clé déjà générée et autorisée).
4. **PHP** : cPanel → "Sélecteur de version PHP", choisis PHP 8.3 (ou 8.2 minimum) pour le
   dossier de l'API.
5. **SSL** : cPanel → "SSL/TLS Status" → active le certificat Let's Encrypt gratuit sur
   `zubr-fit.com` et `api.zubr-fit.com`.

## 1. Backend (Symfony)

Sur le serveur, en SSH :

```bash
cd ~/api_zubr_fit
git clone <url-de-ton-repo> .
cd backend
cp .env.example .env
composer install --no-dev --optimize-autoloader
```

Le fichier `.env` ne contient que des valeurs de dev par défaut (aucun secret) mais n'est
volontairement pas commité dans Git — Symfony a besoin qu'il existe avant de charger
`.env.prod.local` par-dessus, d'où le `cp` ci-dessus.

Crée le fichier de secrets réels **directement sur le serveur** (jamais dans Git) :

```bash
nano .env.prod.local
```

Colle le contenu de [`backend/.env.prod.example`](backend/.env.prod.example) et remplis les
vraies valeurs (base de données, `APP_SECRET`, `JWT_PASSPHRASE`).

**Important** : le flag `--env=prod` des commandes `bin/console` est obsolète et ne change plus
rien depuis Symfony 6+ — il faut passer `APP_ENV=prod` comme vraie variable d'environnement
devant chaque commande, sinon Symfony continue de lire le `.env` de dev (mauvaise base de
données, mauvais `JWT_PASSPHRASE`, etc.).

Génère les clés JWT de production (différentes de celles du dev) :

```bash
APP_ENV=prod php bin/console lexik:jwt:generate-keypair --overwrite
```

Migre la base et vide le cache :

```bash
APP_ENV=prod php bin/console doctrine:migrations:migrate --no-interaction
APP_ENV=prod php bin/console cache:clear
```

Vérifie les droits d'écriture (cache, logs, fichiers uploadés) :

```bash
chmod -R 775 var public/uploads
```

**Le document root du sous-domaine `api.zubr-fit.com` doit pointer vers `backend/public`**
(pas `backend/`) — configurable dans cPanel → "Sous-domaines" → modifier le dossier racine.
Le [`.htaccess`](backend/public/.htaccess) qu'on vient d'ajouter s'occupe du reste (routage
vers `index.php`, transmission de l'en-tête `Authorization` pour le JWT, et surtout
`SetEnv APP_ENV prod` — sans cette ligne, le site web tournerait en environnement de dev
même si les commandes en SSH sont bien lancées avec `APP_ENV=prod`).

## 2. Frontend (React)

En local (ou en SSH si Node.js est dispo sur le serveur, via "Setup Node.js App" dans cPanel) :

```bash
cd frontend
cp .env.production.example .env.production
# vérifie que VITE_API_URL pointe bien vers https://api.zubr-fit.com
npm install
npm run build
```

Ça génère un dossier `dist/`. Envoie **le contenu** de `dist/` (pas le dossier lui-même)
dans `public_html/` via FTP ou le File Manager. Le [`.htaccess`](frontend/public/.htaccess)
(déjà copié dans `dist/` au build, car il vit dans `frontend/public/`) permet à React
Router de fonctionner correctement même après un rechargement de page.

## 3. Vérification

- `https://api.zubr-fit.com/api/exercise/` doit répondre (401 si pas de token, c'est normal)
- `https://zubr-fit.com` doit afficher l'accueil, et la connexion doit fonctionner
- Si erreur CORS dans la console : vérifie `CORS_ALLOW_ORIGIN` dans `.env.prod.local`

## Rappel sécurité

- `.env.prod.local` et tout fichier contenant un vrai secret **n'existent que sur le
  serveur**, jamais dans Git, jamais dans une branche — c'est `.gitignore` qui s'en charge
  automatiquement pour tout fichier `.env.*` (sauf les modèles `.example`).
- Pour mettre à jour le site plus tard : `git pull`, `composer install`, migrations si besoin,
  `cache:clear` — sans jamais toucher à `.env.prod.local`.
