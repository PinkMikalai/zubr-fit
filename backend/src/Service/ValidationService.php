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
}
