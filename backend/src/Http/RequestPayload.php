<?php

namespace App\Http;

use Symfony\Component\HttpFoundation\Request;

/**
 * Récupère les données envoyées par le client, qu'elles arrivent en JSON
 * (Content-Type: application/json) ou en multipart/form-data (cas d'un envoi de fichier).
 *
 * Avant, ce bloc était recopié dans AuthController, UserController et ExerciseController.
 */
final class RequestPayload
{
    public static function extract(Request $request): array
    {
        $contentType = $request->headers->get('Content-Type') ?? '';

        if (str_contains($contentType, 'multipart/form-data')) {
            return $request->request->all();
        }

        $decoded = json_decode($request->getContent(), true);

        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }
}
