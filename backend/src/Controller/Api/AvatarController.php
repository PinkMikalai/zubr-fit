<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\MediaUploader;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/user/avatar', name: 'user_avatar_')]
final class AvatarController extends AbstractController
{
    public function __construct(
        private MediaUploader $mediaUploader,
        private EntityManagerInterface $em
    ) {
    }

    #[Route('/upload', name: 'upload', methods: ['POST'])]
    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        $file = $request->files->get('avatar');

        if (!$file) {
            return $this->json([
                'status' => false,
                'message' => 'Aucun fichier fourni'
            ], 400);
        }

        $result = $this->mediaUploader->uploadAvatar($file);

        if (!$result['success']) {
            return $this->json([
                'status' => false,
                'message' => $result['error'],
                'code' => $result['code']
            ], 400);
        }

        $oldAvatar = $user->getAvatar();
        if ($oldAvatar) {
            $this->mediaUploader->deleteAvatar($oldAvatar);
        }

        $user->setAvatar($result['filename']);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => [
                'filename' => $result['filename'],
                'url' => $result['path'],
                'size' => $result['size']
            ],
            'message' => 'Avatar mis à jour avec succès'
        ], 200);
    }

    #[Route('/', name: 'get', methods: ['GET'])]
    public function getAvatar(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        $avatar = $user->getAvatar();

        return $this->json([
            'status' => true,
            'data' => [
                'filename' => $avatar,
                'url' => $this->mediaUploader->getAvatarUrl($avatar),
                'exists' => $this->mediaUploader->avatarExists($avatar)
            ]
        ]);
    }

    #[Route('/', name: 'delete', methods: ['DELETE'])]
    public function deleteAvatar(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Non autorisé'
            ], 401);
        }

        $avatar = $user->getAvatar();

        if (!$avatar) {
            return $this->json([
                'status' => false,
                'message' => 'Aucun avatar à supprimer'
            ], 404);
        }

        $deleted = $this->mediaUploader->deleteAvatar($avatar);

        if ($deleted) {
            $user->setAvatar(null);
            $this->em->flush();

            return $this->json([
                'status' => true,
                'message' => 'Avatar supprimé avec succès'
            ]);
        }

        return $this->json([
            'status' => false,
            'message' => 'Impossible de supprimer l\'avatar'
        ], 500);
    }
}
