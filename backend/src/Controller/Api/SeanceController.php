<?php

namespace App\Controller\Api;

use App\Entity\Seance;
use App\Entity\SeanceUser;
use App\Entity\User;
use App\Repository\SeanceRepository;
use App\Repository\SeanceUserRepository;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/seance', name: 'seance')]
final class SeanceController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private SeanceRepository $seanceRepository,
        private SeanceUserRepository $seanceUserRepository
    ) {
    }

    #[Route('/', name: 'seance_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $data = $this->seanceRepository->findAllByUserDESC($user);

        if (!$data) {
            return $this->json([
                'status' => false,
                'data' => null,
                'message' => 'No seances found'
            ]);
        }

        return $this->json([
            'status' => true,
            'data' => $data,
            'message' => 'Seances fetched successfully'
        ]);
    }

    #[Route('/new', name: 'seance_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'status' => false,
                'data' => null,
                'message' => 'Invalid JSON data'
            ], 400);
        }

        if (!isset($data['name']) || empty($data['name'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le nom est obligatoire'
            ], 400);
        }

        if (!isset($data['duration']) || !is_numeric($data['duration'])) {
            return $this->json([
                'status' => false,
                'message' => 'La durée est obligatoire et doit être un nombre'
            ], 400);
        }

        $seance = new Seance();
        $seance->setName($data['name']);
        $seance->setDuration((int)$data['duration']);
        $seance->setComment($data['comment'] ?? null);

        $errorResponse = $this->validationService->getErrorResponse($seance);
        if ($errorResponse) {
            return $errorResponse;
        }

        $seanceUser = new SeanceUser();
        $seanceUser->setSeance($seance);
        $seanceUser->setUser($user);

        $this->em->persist($seance);
        $this->em->persist($seanceUser);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance created successfully'
        ], 201);
    }

    #[Route('/{id}', name: 'seance_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $user)) {
            return $this->json([
                'status' => false,
                'message' => 'Access denied'
            ], 403);
        }

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance found'
        ]);
    }

    #[Route('/{id}', name: 'seance_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $user)) {
            return $this->json([
                'status' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }

        $seance->setName($data['name'] ?? $seance->getName());
        $seance->setDuration($data['duration'] ?? $seance->getDuration());
        $seance->setComment($data['comment'] ?? $seance->getComment());

        $errorResponse = $this->validationService->getErrorResponse($seance);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance updated successfully'
        ]);
    }

    #[Route('/{id}', name: 'seance_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $user)) {
            return $this->json([
                'status' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $this->em->remove($seance);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'message' => 'Seance deleted successfully'
        ]);
    }

    #[Route('/{id}/complete', name: 'seance_complete', methods: ['PUT'])]
    public function complete(int $id): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $user)) {
            return $this->json([
                'status' => false,
                'message' => 'Access denied'
            ], 403);
        }

        $seance->setCompletedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance marked as completed'
        ]);
    }

    #[Route('/{id}/assign', name: 'seance_assign', methods: ['POST'])]
    public function assign(int $id, Request $request): JsonResponse
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
                'message' => 'Only coaches can assign seances'
            ], 403);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $coach)) {
            return $this->json([
                'status' => false,
                'message' => 'You can only assign your own seances'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userIds = $this->extractUserIds($data);

        if (empty($userIds)) {
            return $this->json([
                'status' => false,
                'message' => 'user_id or user_ids is required'
            ], 400);
        }

        $users = $this->em->getRepository(User::class)->findBy(['id' => $userIds]);

        if (count($users) !== count($userIds)) {
            return $this->json([
                'status' => false,
                'message' => 'One or more users not found'
            ], 404);
        }

        foreach ($users as $user) {
            if ($this->isLinked($seance, $user)) {
                continue;
            }

            $seanceUser = new SeanceUser();
            $seanceUser->setSeance($seance);
            $seanceUser->setUser($user);
            $this->em->persist($seanceUser);
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance assigned successfully'
        ]);
    }

    #[Route('/{id}/assign', name: 'seance_unassign', methods: ['DELETE'])]
    public function unassign(int $id, Request $request): JsonResponse
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
                'message' => 'Only coaches can unassign seances'
            ], 403);
        }

        $seance = $this->em->getRepository(Seance::class)->find($id);

        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        if (!$this->isLinked($seance, $coach)) {
            return $this->json([
                'status' => false,
                'message' => 'You can only unassign your own seances'
            ], 403);
        }

        $data = json_decode($request->getContent(), true);
        $userIds = $this->extractUserIds($data);

        if (empty($userIds)) {
            return $this->json([
                'status' => false,
                'message' => 'user_id or user_ids is required'
            ], 400);
        }

        $users = $this->em->getRepository(User::class)->findBy(['id' => $userIds]);

        foreach ($users as $user) {
            $seanceUser = $this->seanceUserRepository->findOneBy(['seance' => $seance, 'user' => $user]);

            if ($seanceUser) {
                $this->em->remove($seanceUser);
            }
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $seance,
            'message' => 'Seance unassigned successfully'
        ]);
    }

    /**
     * Vérifie si un utilisateur est lié à une séance (créateur ou assigné).
     */
    private function isLinked(Seance $seance, User $user): bool
    {
        return $this->seanceUserRepository->count(['seance' => $seance, 'user' => $user]) > 0;
    }

    /**
     * Extrait une liste d'IDs utilisateur à partir de user_id (un seul) ou user_ids (plusieurs).
     */
    private function extractUserIds(?array $data): array
    {
        if (!$data) {
            return [];
        }

        if (!empty($data['user_ids']) && is_array($data['user_ids'])) {
            return array_values(array_unique(array_map('intval', $data['user_ids'])));
        }

        if (!empty($data['user_id'])) {
            return [(int) $data['user_id']];
        }

        return [];
    }
}
