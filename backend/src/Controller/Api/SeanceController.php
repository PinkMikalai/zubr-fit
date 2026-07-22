<?php

namespace App\Controller\Api;

use App\Entity\Seance;
use App\Entity\User;
use App\Repository\SeanceRepository;
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
        private SeanceRepository $seanceRepository
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

    #[Route('/', name: 'seance_create', methods: ['POST'])]
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

        $seance = new Seance();
        $seance->setName($data['name'] ?? '');
        $seance->setDuration($data['duration'] ?? 0);
        $seance->setComment($data['comment'] ?? null);
        $seance->addUser($user);

        $errorResponse = $this->validationService->getErrorResponse($seance);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->persist($seance);
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

        if (!$seance->getUsers()->contains($user)) {
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

        if (!$seance->getUsers()->contains($user)) {
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

        if (!$seance->getUsers()->contains($user)) {
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

        if (!$seance->getUsers()->contains($user)) {
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
}
