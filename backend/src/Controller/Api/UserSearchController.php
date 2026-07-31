<?php

namespace App\Controller\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

// Recherche d'utilisateurs, réservée aux coachs : sert à trouver un utilisateur
// (par nom, prénom, email ou téléphone) pour l'ajouter comme client.
// Séparé de UserController (qui gère "mon propre profil") car c'est une responsabilité différente.
#[Route('/api/users', name: 'user_search_')]
final class UserSearchController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em
    ) {
    }

    #[Route('', name: 'search', methods: ['GET'])]
    public function search(Request $request): JsonResponse
    {
        $coach = $this->getUser();

        if (!$coach instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        if (!in_array('ROLE_COACH', $coach->getRoles(), true)) {
            return $this->json([
                'status' => false,
                'message' => 'Only coaches can search users'
            ], 403);
        }

        // Le paramètre de recherche est optionnel : sans lui, on renvoie la liste complète
        $query = $request->query->get('q');

        $allUsers = $this->em->getRepository(User::class)->findAll();
        $results = [];

        foreach ($allUsers as $user) {
            // On exclut les autres coachs (ce ne sont pas des clients potentiels)
            if (in_array('ROLE_COACH', $user->getRoles(), true)) {
                continue;
            }

            // On s'exclut soi-même
            if ($user->getId() === $coach->getId()) {
                continue;
            }

            if ($query && !$this->matchesQuery($user, $query)) {
                continue;
            }

            $avatarUrl = null;
            if ($user->getAvatar()) {
                $avatarUrl = '/uploads/avatars/' . $user->getAvatar();
            }

            $results[] = [
                'id' => $user->getId(),
                'firstname' => $user->getFirstname(),
                'lastname' => $user->getLastname(),
                'email' => $user->getEmail(),
                'phoneNumber' => $user->getPhoneNumber(),
                'avatarUrl' => $avatarUrl,
            ];
        }

        return $this->json([
            'status' => true,
            'data' => $results,
            'message' => 'Users fetched successfully'
        ]);
    }

    /**
     * Vérifie si le nom, prénom, email ou téléphone de l'utilisateur contient le texte recherché.
     */
    private function matchesQuery(User $user, string $query): bool
    {
        $needle = strtolower($query);

        $haystacks = [
            $user->getFirstname(),
            $user->getLastname(),
            $user->getEmail(),
            $user->getPhoneNumber(),
        ];

        foreach ($haystacks as $haystack) {
            if ($haystack && str_contains(strtolower($haystack), $needle)) {
                return true;
            }
        }

        return false;
    }
}
