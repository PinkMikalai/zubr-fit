<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\CoachClientRepository;
use App\Service\MediaUploader;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/profile', name: 'profile')]
final class UserController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private UserPasswordHasherInterface $passwordHasher,
        private MediaUploader $mediaUploader,
        private CoachClientRepository $coachClientRepository
    ) {
    }

    #[Route('', name: 'profile_index', methods: ['GET'])]
    public function show(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        return $this->json([
            'status' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'phoneNumber' => $user->getPhoneNumber(),
                'avatar' => $user->getAvatar(),
                'avatarUrl' => $user->getAvatar() ? '/uploads/avatars/' . $user->getAvatar() : null,
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $user->getUpdatedAt()?->format('Y-m-d H:i:s')
            ],
            'message' => 'Profil récupéré avec succès'
        ]);
    }

    // Voir le profil d'un client précis : réservé au coach qui gère (ou a géré) ce client.
    // Sans cette vérification, n'importe quel utilisateur connecté pourrait consulter les
    // coordonnées de n'importe qui juste en devinant un id dans l'URL.
    #[Route('/{id}', name: 'profile_show', methods: ['GET'])]
    public function showUser(int $id): JsonResponse
    {
        $coach = $this->getUser();
        if (!$coach instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json([
                'status' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        if (!in_array('ROLE_COACH', $coach->getRoles(), true) || !$this->coachClientRepository->findRelation($coach, $user)) {
            return $this->json([
                'status' => false,
                'message' => 'Accès refusé'
            ], 403);
        }

        return $this->json([
            'status' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'phoneNumber' => $user->getPhoneNumber(),
                'avatar' => $user->getAvatar(),
                'avatarUrl' => $user->getAvatar() ? '/uploads/avatars/' . $user->getAvatar() : null,
                'roles' => $user->getRoles(),
                'createdAt' => $user->getCreatedAt()?->format('Y-m-d H:i:s'),
                'updatedAt' => $user->getUpdatedAt()?->format('Y-m-d H:i:s')
            ],
            'message' => 'Profil récupéré avec succès'
        ]);
    }

    //mettre à jour le profil d'un utilisateur
    #[Route('/update', name: 'update', methods: ['POST'])]
    public function update(Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        $avatarFile = $request->files->get('avatar') ?? $request->files->get('Avatar');
        
        if ($avatarFile) {
            $result = $this->mediaUploader->uploadAvatar($avatarFile);
            
            if (!$result['success']) {
                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            // Supprimer l'ancien avatar s'il existe
            $oldAvatar = $user->getAvatar();
            if ($oldAvatar) {
                $this->mediaUploader->deleteAvatar($oldAvatar);
            }

            $user->setAvatar($result['filename']);
        }

        $contentType = $request->headers->get('Content-Type') ?? '';

        if (str_contains($contentType, 'multipart/form-data')) {
            $data = $request->request->all();
        } else {
            $data = json_decode($request->getContent(), true) ?? [];
        }

        if (isset($data['firstname'])) {
            $user->setFirstname($data['firstname']);
        }

        if (isset($data['lastname'])) {
            $user->setLastname($data['lastname']);
        }

        if (isset($data['phoneNumber'])) {
            $user->setPhoneNumber($data['phoneNumber']);
        }

        if (isset($data['email'])) {
            $existingUser = $this->em->getRepository(User::class)
                ->findOneBy(['email' => $data['email']]);

            if ($existingUser && $existingUser->getId() !== $user->getId()) {
                return $this->json([
                    'status' => false,
                    'message' => 'Cet email est déjà utilisé'
                ], 409);
            }

            $user->setEmail($data['email']);
        }

        if (isset($data['password']) && !empty($data['password'])) {
            $passwordError = $this->validationService->getPasswordError($data['password']);
            if ($passwordError) {
                return $this->json([
                    'status' => false,
                    'message' => $passwordError
                ], 400);
            }

            $hashedPassword = $this->passwordHasher->hashPassword($user, $data['password']);
            $user->setPassword($hashedPassword);
        }

        $errorResponse = $this->validationService->getErrorResponse($user);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'phoneNumber' => $user->getPhoneNumber(),
                'avatar' => $user->getAvatar(),
                'avatarUrl' => $user->getAvatar() ? '/uploads/avatars/' . $user->getAvatar() : null
            ],
            'message' => 'Profil mis à jour avec succès'
        ]);
    }
}
