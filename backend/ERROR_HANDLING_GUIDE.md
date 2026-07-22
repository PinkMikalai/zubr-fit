# 🚨 Guide de Gestion des Erreurs

## 📁 Fichiers Responsables

### 1. **ValidationService.php** ✅
**Chemin:** `src/Service/ValidationService.php`

**Rôle:** Valide les entités Doctrine

**Utilisation:**
```php
$errorResponse = $this->validationService->getErrorResponse($user);
if ($errorResponse) {
    return $errorResponse; // 422
}
```

**Réponse:**
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "email": "L'email n'est pas valide"
  }
}
```

---

### 2. **ExceptionSubscriber.php** ✅ NOUVEAU !
**Chemin:** `src/EventSubscriber/ExceptionSubscriber.php`

**Rôle:** Capture TOUTES les exceptions non gérées et les transforme en JSON

**Avantages:**
- ✅ Format JSON uniforme pour toutes les erreurs
- ✅ Logging automatique de toutes les exceptions
- ✅ Détails de debug en mode développement
- ✅ Messages sécurisés en production

**Exemple de réponse (mode dev):**
```json
{
  "status": false,
  "message": "SplFileInfo::getSize(): stat failed",
  "code": "INTERNAL_SERVER_ERROR",
  "statusCode": 500,
  "debug": {
    "exception": "RuntimeException",
    "file": "/path/to/file.php",
    "line": 42,
    "trace": ["..."]
  }
}
```

**En production (sans debug):**
```json
{
  "status": false,
  "message": "Une erreur est survenue",
  "code": "INTERNAL_SERVER_ERROR",
  "statusCode": 500
}
```

---

### 3. **MediaUploader.php**
**Chemin:** `src/Service/MediaUploader.php`

**Rôle:** Gère les erreurs d'upload de fichiers

**Codes d'erreur:**
```php
'FILE_TOO_LARGE'       // Fichier trop gros
'INVALID_FILE_TYPE'    // Type MIME invalide
'INVALID_EXTENSION'    // Extension invalide
'UPLOAD_FAILED'        // Erreur lors de l'upload
'SECURITY_RISK'        // Fichier dangereux détecté
```

---

### 4. **Contrôleurs**
**Chemin:** `src/Controller/Api/*.php`

**Codes HTTP utilisés:**
- `200` OK
- `201` Created
- `400` Bad Request (données invalides)
- `401` Unauthorized (pas de token)
- `403` Forbidden (pas de droits)
- `404` Not Found
- `409` Conflict (email déjà utilisé)
- `422` Unprocessable Entity (validation)
- `500` Internal Server Error

---

## 🎯 Types d'Erreurs

### Type 1 : Erreurs de Validation (422)

**Déclenchées par:** ValidationService

**Exemple:**
```json
{
  "status": false,
  "message": "Validation failed",
  "errors": {
    "email": "L'email n'est pas valide",
    "password": "Le mot de passe doit contenir au moins 6 caractères"
  }
}
```

---

### Type 2 : Erreurs Métier (400, 401, 403, 404, 409)

**Déclenchées par:** Contrôleurs

**Exemples:**

**401 Unauthorized:**
```json
{
  "status": false,
  "message": "Non autorisé"
}
```

**403 Forbidden:**
```json
{
  "status": false,
  "message": "Access denied"
}
```

**404 Not Found:**
```json
{
  "status": false,
  "message": "Seance not found"
}
```

**409 Conflict:**
```json
{
  "status": false,
  "message": "Cet email est déjà utilisé"
}
```

---

### Type 3 : Erreurs d'Upload (400)

**Déclenchées par:** MediaUploader

**Exemple:**
```json
{
  "status": false,
  "message": "Fichier trop volumineux. Taille maximale: 5.0 MB",
  "code": "FILE_TOO_LARGE"
}
```

---

### Type 4 : Erreurs Système (500)

**Déclenchées par:** ExceptionSubscriber

**Exemple (dev):**
```json
{
  "status": false,
  "message": "Call to undefined method",
  "code": "INTERNAL_SERVER_ERROR",
  "statusCode": 500,
  "debug": {
    "exception": "Error",
    "file": "/path/to/Controller.php",
    "line": 123
  }
}
```

---

## 🔧 Configuration

### Mode Développement (.env)
```env
APP_ENV=dev
```
→ Affiche les détails de debug

### Mode Production (.env)
```env
APP_ENV=prod
```
→ Cache les détails sensibles

---

## 📊 Hiérarchie de Gestion

```
Requête
  │
  ├─→ Firewall Security (security.yaml)
  │     │
  │     └─→ 401 Unauthorized (pas de token)
  │
  ├─→ Contrôleur
  │     │
  │     ├─→ 403 Forbidden (pas de droits)
  │     ├─→ 404 Not Found
  │     ├─→ 409 Conflict
  │     │
  │     └─→ ValidationService
  │           │
  │           └─→ 422 Validation Failed
  │
  └─→ Exception Non Gérée
        │
        └─→ ExceptionSubscriber
              │
              └─→ 500 Internal Server Error
```

---

## 💡 Bonnes Pratiques

### 1. Toujours retourner un format JSON cohérent
```php
return $this->json([
    'status' => false,
    'message' => 'Message d'erreur',
    'data' => null  // ou des détails
], $statusCode);
```

### 2. Utiliser les bons codes HTTP
- `401` → Pas authentifié
- `403` → Pas autorisé
- `404` → Ressource introuvable
- `422` → Validation échouée
- `500` → Erreur serveur

### 3. Logger les erreurs importantes
```php
$this->logger->error('Message', [
    'user_id' => $user->getId(),
    'context' => '...'
]);
```

### 4. Ne jamais exposer de détails sensibles en production
```php
if ($this->environment === 'dev') {
    // Détails de debug
}
```

---

## 🧪 Tester les Erreurs

### Test 401 Unauthorized
```bash
curl -X GET http://localhost:8000/api/user/profile
# (sans token)
```

### Test 404 Not Found
```bash
curl -X GET http://localhost:8000/api/seance/99999 \
  -H "Authorization: Bearer TOKEN"
```

### Test 422 Validation
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid"}'
```

### Test 500 Internal Error
Provoquez une erreur dans le code :
```php
throw new \Exception('Test error');
```

---

## 📝 Logs

Les erreurs sont loguées dans :
```
backend/var/log/dev.log
backend/var/log/prod.log
```

**Voir les logs:**
```bash
tail -f backend/var/log/dev.log
```

---

## ✅ Résumé

| Fichier | Rôle | Code HTTP |
|---------|------|-----------|
| **ValidationService** | Validation entités | 422 |
| **ExceptionSubscriber** | Capture exceptions | 500 |
| **MediaUploader** | Erreurs upload | 400 |
| **Contrôleurs** | Erreurs métier | 400-409 |
| **Security** | Auth/Authorization | 401, 403 |

Tous les fichiers travaillent ensemble pour fournir une **gestion d'erreurs robuste et cohérente** ! 🚀
