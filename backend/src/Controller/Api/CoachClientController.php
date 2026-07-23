<?php

namespace App\Controller\Api;

use App\Entity\CoachClient;
use App\Entity\User;
use App\Repository\CoachClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/coach/clients', name: 'coach_client_')]
final class CoachClientController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private CoachClientRepository $coachClientRepository
    ) {
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $coach = $this->resolveCoach();
        if ($coach instanceof JsonResponse) {
            return $coach;
        }

        $clients = $this->coachClientRepository->findActiveByCoach($coach);

        return $this->json([
            'status' => true,
            'data' => array_map($this->serialize(...), $clients),
            'message' => 'Clients fetched successfully'
        ]);
    }

    #[Route('/history', name: 'history', methods: ['GET'])]
    public function history(): JsonResponse
    {
        $coach = $this->resolveCoach();
        if ($coach instanceof JsonResponse) {
            return $coach;
        }

        $history = $this->coachClientRepository->findHistoryByCoach($coach);

        return $this->json([
            'status' => true,
            'data' => array_map($this->serialize(...), $history),
            'message' => 'Client history fetched successfully'
        ]);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(Request $request): JsonResponse
    {
        $coach = $this->resolveCoach();
        if ($coach instanceof JsonResponse) {
            return $coach;
        }

        $data = json_decode($request->getContent(), true);
        if (empty($data['client_id'])) {
            return $this->json([
                'status' => false,
                'message' => 'client_id is required'
            ], 400);
        }

        $clientId = (int) $data['client_id'];

        if ($clientId === $coach->getId()) {
            return $this->json([
                'status' => false,
                'message' => 'A coach cannot add themselves as a client'
            ], 400);
        }

        $client = $this->em->getRepository(User::class)->find($clientId);
        if (!$client) {
            return $this->json([
                'status' => false,
                'message' => 'Client not found'
            ], 404);
        }

        if ($this->coachClientRepository->findActiveRelation($coach, $client)) {
            return $this->json([
                'status' => false,
                'message' => 'This client is already in your active client list'
            ], 409);
        }

        $coachClient = new CoachClient();
        $coachClient->setCoach($coach);
        $coachClient->setClient($client);

        $this->em->persist($coachClient);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $this->serialize($coachClient),
            'message' => 'Client added successfully'
        ], 201);
    }

    #[Route('/{id}', name: 'remove', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function remove(int $id): JsonResponse
    {
        $coach = $this->resolveCoach();
        if ($coach instanceof JsonResponse) {
            return $coach;
        }

        $coachClient = $this->coachClientRepository->find($id);

        if (!$coachClient || $coachClient->getCoach()?->getId() !== $coach->getId()) {
            return $this->json([
                'status' => false,
                'message' => 'Client relation not found'
            ], 404);
        }

        if (!$coachClient->isActive()) {
            return $this->json([
                'status' => false,
                'message' => 'This client relation has already ended'
            ], 409);
        }

        $coachClient->setEndedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $this->serialize($coachClient),
            'message' => 'Client removed from active list, kept in history'
        ]);
    }

    /**
     * Vérifie que l'utilisateur connecté est bien un coach.
     */
    private function resolveCoach(): User|JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        if (!in_array('ROLE_COACH', $user->getRoles(), true)) {
            return $this->json([
                'status' => false,
                'message' => 'Only coaches can manage a client list'
            ], 403);
        }

        return $user;
    }

    private function serialize(CoachClient $coachClient): array
    {
        $client = $coachClient->getClient();

        return [
            'id' => $coachClient->getId(),
            'startedAt' => $coachClient->getStartedAt()?->format('Y-m-d H:i:s'),
            'endedAt' => $coachClient->getEndedAt()?->format('Y-m-d H:i:s'),
            'isActive' => $coachClient->isActive(),
            'client' => [
                'id' => $client->getId(),
                'firstname' => $client->getFirstname(),
                'lastname' => $client->getLastname(),
                'email' => $client->getEmail(),
                'avatarUrl' => $client->getAvatar() ? '/uploads/avatars/' . $client->getAvatar() : null,
            ],
        ];
    }
}
