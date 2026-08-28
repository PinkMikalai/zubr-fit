<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Http\RequestPayload;
use App\Service\MediaUploader;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;

#[Route('/api/auth', name: 'auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtTokenManager,
        private ValidationService $validationService,
        private MediaUploader $mediaUploader
    ) {
    }

    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        // On récupère le fichier maintenant, mais on ne l'uploade qu'À LA FIN,
        // une fois toutes les validations passées : pas besoin de nettoyer un fichier
        // déjà écrit sur le disque si l'inscription échoue plus loin.
        $avatarFile = $request->files->get('avatar');

        $data = RequestPayload::extract($request);

        if (empty($data)) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid data',
                'errors' => 'Invalid data',
            ], 400);
        }

        if (!isset($data['email']) || empty($data['email'])) {
            return $this->json([
                'status' => false,
                'message' => 'L\'email est obligatoire'
            ], 400);
        }

        if (!isset($data['firstname']) || empty($data['firstname'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le prénom est obligatoire'
            ], 400);
        }

        if (!isset($data['lastname']) || empty($data['lastname'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le nom est obligatoire'
            ], 400);
        }

        if (!isset($data['password']) || empty($data['password'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le mot de passe est obligatoire'
            ], 400);
        }

        $passwordError = $this->validationService->getPasswordError($data['password']);
        if ($passwordError) {
            return $this->json([
                'status' => false,
                'message' => $passwordError
            ], 400);
        }

        if (!isset($data['role']) || empty($data['role'])) {
            return $this->json([
                'status' => false,
                'message' => 'Role is required',
            ], 422);
        }

        $allowedRoles = [
            'user' => 'ROLE_USER',
            'coach' => 'ROLE_COACH',
        ];

        if (!isset($allowedRoles[$data['role']])) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid role. Must be "user" or "coach"',
            ], 422);
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setFirstname($data['firstname']);
        $user->setLastname($data['lastname']);
        $user->setPhoneNumber($data['phoneNumber'] ?? null);
        $user->setRoles([$allowedRoles[$data['role']]]);

        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $data['password']
        );
        $user->setPassword($hashedPassword);

        $errorResponse = $this->validationService->getErrorResponse($user);
        if ($errorResponse) {
            return $errorResponse;
        }

        $existingUser = $this->em
            ->getRepository(User::class)
            ->findOneBy(['email' => $user->getEmail()]);

        if ($existingUser) {
            return $this->json([
                'status' => false,
                'message' => 'Email already registered',
            ], 409);
        }

        // Toutes les validations sont passées : on peut maintenant écrire l'avatar sur le disque.
        $avatarFilename = null;
        if ($avatarFile) {
            $result = $this->mediaUploader->uploadAvatar($avatarFile);

            if (!$result['success']) {
                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            $avatarFilename = $result['filename'];
            $user->setAvatar($avatarFilename);
        }

        $this->em->persist($user);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'message' => 'User registered successfully. You can now login.',
            'data' => [
                'user' => $user,
                'avatarUrl' => $avatarFilename ? '/uploads/avatars/' . $avatarFilename : null
            ],
        ], 201);
    }

    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || !isset($data['email']) || !isset($data['password'])) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid JSON data or missing email or password',
            ], 400);
        }

        // Vérifier utilisateur et mot de passe (message générique pour la sécurité)
        $user = $this->em
            ->getRepository(User::class)
            ->findOneBy(['email' => $data['email']]);

        if (!$user || !$this->passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Créer le token JWT
        $token = $this->jwtTokenManager->create($user);

        return $this->json([
            'status' => true,
            'message' => 'User logged in successfully',
            'data' => [
                'token' => $token,
                'user' => $user,
            ],
        ], 200);
    }


    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json([
            'status' => true,
            'message' => 'Logged out successfully. Please remove token from client.',
        ], 200);
    }
}
