<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ValidationService
{
    public function __construct(
        private ValidatorInterface $validator
    ) {
    }

    public function validate(object $entity): ?array
    {
        $errors = $this->validator->validate($entity);

        if (count($errors) === 0) {
            return null;
        }

        $errorMessages = [];
        foreach ($errors as $error) {
            $errorMessages[$error->getPropertyPath()] = $error->getMessage();
        }

        return $errorMessages;
    }

    public function getErrorResponse(object $entity): ?JsonResponse
    {
        $errors = $this->validate($entity);

        if (!$errors) {
            return null;
        }

        return new JsonResponse([
            'status' => false,
            'message' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }

    // Règles du mot de passe, partagées entre l'inscription et la modification du profil.
    // On vérifie dans l'ordre pour ne renvoyer qu'un seul message à la fois.
    public function getPasswordError(string $password): ?string
    {
        if (strlen($password) < 6) {
            return 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            return 'Le mot de passe doit contenir au moins une majuscule';
        }

        if (!preg_match('/[0-9]/', $password)) {
            return 'Le mot de passe doit contenir au moins un chiffre';
        }

        return null;
    }
}
