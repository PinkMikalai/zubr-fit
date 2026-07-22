<?php

namespace App\Controller\Api;

use App\Entity\User;
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
        $avatarFile = $request->files->get('avatar') ?? $request->files->get('Avatar');
        
        $contentType = $request->headers->get('Content-Type');
        
        if (str_contains($contentType, 'multipart/form-data')) {
            $data = $request->request->all();
        } else {
            $data = json_decode($request->getContent(), true) ?? [];
        }

        if (empty($data)) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid data',
                'errors' => 'Invalid data',
            ], 400);
        }

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
        }

        $user = new User();
        $user->setEmail($data['email'] ?? '');
        $user->setFirstname($data['firstname'] ?? '');
        $user->setLastname($data['lastname'] ?? '');
        $user->setPhoneNumber($data['phoneNumber'] ?? null);
        $user->setAvatar($avatarFilename);

        if (!isset($data['role']) || empty($data['role'])) {
            if ($avatarFilename) {
                $this->mediaUploader->deleteAvatar($avatarFilename);
            }
            
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
            if ($avatarFilename) {
                $this->mediaUploader->deleteAvatar($avatarFilename);
            }
            
            return $this->json([
                'status' => false,
                'message' => 'Invalid role. Must be "user" or "coach"',
            ], 422);
        }

        $user->setRoles([$allowedRoles[$data['role']]]);

        if (isset($data['password'])) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                $data['password']
            );
            $user->setPassword($hashedPassword);
        }

        $errorResponse = $this->validationService->getErrorResponse($user);
        if ($errorResponse) {
            if ($avatarFilename) {
                $this->mediaUploader->deleteAvatar($avatarFilename);
            }
            return $errorResponse;
        }

        $existingUser = $this->em
            ->getRepository(User::class)
            ->findOneBy(['email' => $user->getEmail()]);

        if ($existingUser) {
            if ($avatarFilename) {
                $this->mediaUploader->deleteAvatar($avatarFilename);
            }
            
            return $this->json([
                'status' => false,
                'message' => 'Email already registered',
            ], 409);
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

    #[Route('/me', name: 'me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        return $this->json([
            'status' => true,
            'message' => 'User information',
            'data' => [
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
