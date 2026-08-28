<?php

namespace App\Controller\Api;

use App\Entity\CoachClient;
use App\Entity\User;
use App\Repository\CoachClientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/coach/clients', name: 'coach_client_')]
#[IsGranted('ROLE_COACH', message: 'Seuls les coachs peuvent gérer une liste de clients.')]
final class CoachClientController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private CoachClientRepository $coachClientRepository
    ) {
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(#[CurrentUser] User $coach): JsonResponse
    {
        $clients = $this->coachClientRepository->findActiveByCoach($coach);

        return $this->json([
            'status' => true,
            'data' => array_map($this->serialize(...), $clients),
            'message' => 'Clients fetched successfully'
        ]);
    }

    #[Route('/history', name: 'history', methods: ['GET'])]
    public function history(#[CurrentUser] User $coach): JsonResponse
    {
        $history = $this->coachClientRepository->findHistoryByCoach($coach);

        return $this->json([
            'status' => true,
            'data' => array_map($this->serialize(...), $history),
            'message' => 'Client history fetched successfully'
        ]);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(Request $request, #[CurrentUser] User $coach): JsonResponse
    {
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
    public function remove(int $id, #[CurrentUser] User $coach): JsonResponse
    {
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
