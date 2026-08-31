<?php

namespace App\Controller\Api;

use App\Entity\Exercise;
use App\Entity\Seance;
use App\Entity\SeanceExercise;
use App\Repository\SeanceExerciseRepository;
use App\Security\Voter\SeanceVoter;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/seance/{seanceId}/exercise', name: 'seance_exercise_')]
final class SeanceExerciseController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private SeanceExerciseRepository $seanceExerciseRepository
    ) {
    }

    #[Route('', name: 'index', methods: ['GET'])]
    public function index(int $seanceId): JsonResponse
    {
        // Lecture seule : accessible à toute personne liée à la séance (client assigné inclus).
        $seance = $this->resolveSeance($seanceId, SeanceVoter::VIEW);
        if ($seance instanceof JsonResponse) {
            return $seance;
        }

        $lines = $this->seanceExerciseRepository->findBy(['seance' => $seance], ['position' => 'ASC']);

        return $this->json([
            'status' => true,
            'data' => array_map($this->serialize(...), $lines),
            'message' => 'Exercises fetched successfully'
        ]);
    }

    #[Route('', name: 'add', methods: ['POST'])]
    public function add(int $seanceId, Request $request): JsonResponse
    {
        // Modifier la structure de la séance : réservé au coach.
        $seance = $this->resolveSeance($seanceId, SeanceVoter::EDIT);
        if ($seance instanceof JsonResponse) {
            return $seance;
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }

        if (empty($data['exercise_id'])) {
            return $this->json([
                'status' => false,
                'message' => 'exercise_id is required'
            ], 400);
        }

        $exercise = $this->em->getRepository(Exercise::class)->find($data['exercise_id']);
        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $seanceExercise = new SeanceExercise();
        $seanceExercise->setSeance($seance);
        $seanceExercise->setExercise($exercise);
        $seanceExercise->setSets((int) ($data['sets'] ?? 0));
        $seanceExercise->setReps((int) ($data['reps'] ?? 0));
        $seanceExercise->setComment($data['comment'] ?? null);
        $seanceExercise->setPosition(
            isset($data['position'])
                ? (int) $data['position']
                : $this->seanceExerciseRepository->count(['seance' => $seance])
        );

        $errorResponse = $this->validationService->getErrorResponse($seanceExercise);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->persist($seanceExercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $this->serialize($seanceExercise),
            'message' => 'Exercise added to seance successfully'
        ], 201);
    }

    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function update(int $seanceId, int $id, Request $request): JsonResponse
    {
        $seance = $this->resolveSeance($seanceId, SeanceVoter::EDIT);
        if ($seance instanceof JsonResponse) {
            return $seance;
        }

        $seanceExercise = $this->resolveSeanceExercise($seance, $id);
        if ($seanceExercise instanceof JsonResponse) {
            return $seanceExercise;
        }

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }

        $seanceExercise->setSets(isset($data['sets']) ? (int) $data['sets'] : $seanceExercise->getSets());
        $seanceExercise->setReps(isset($data['reps']) ? (int) $data['reps'] : $seanceExercise->getReps());
        $seanceExercise->setPosition(isset($data['position']) ? (int) $data['position'] : $seanceExercise->getPosition());
        $seanceExercise->setComment($data['comment'] ?? $seanceExercise->getComment());

        $errorResponse = $this->validationService->getErrorResponse($seanceExercise);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $this->serialize($seanceExercise),
            'message' => 'Seance exercise updated successfully'
        ]);
    }

    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function delete(int $seanceId, int $id): JsonResponse
    {
        $seance = $this->resolveSeance($seanceId, SeanceVoter::EDIT);
        if ($seance instanceof JsonResponse) {
            return $seance;
        }

        $seanceExercise = $this->resolveSeanceExercise($seance, $id);
        if ($seanceExercise instanceof JsonResponse) {
            return $seanceExercise;
        }

        $this->em->remove($seanceExercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'message' => 'Exercise removed from seance successfully'
        ]);
    }

    /**
     * Résout la séance et vérifie l'accès via SeanceVoter (un refus lève une AccessDeniedException 403).
     *
     * @param string $permission SeanceVoter::VIEW pour la lecture (client assigné OK),
     *                           SeanceVoter::EDIT pour les modifications (coach uniquement).
     */
    private function resolveSeance(int $seanceId, string $permission): Seance|JsonResponse
    {
        $seance = $this->em->getRepository(Seance::class)->find($seanceId);
        if (!$seance) {
            return $this->json([
                'status' => false,
                'message' => 'Seance not found'
            ], 404);
        }

        $this->denyAccessUnlessGranted($permission, $seance, 'Access denied');

        return $seance;
    }

    /**
     * Résout une ligne SeanceExercise en s'assurant qu'elle appartient bien à la séance donnée.
     */
    private function resolveSeanceExercise(Seance $seance, int $id): SeanceExercise|JsonResponse
    {
        $seanceExercise = $this->seanceExerciseRepository->find($id);

        if (!$seanceExercise || $seanceExercise->getSeance()?->getId() !== $seance->getId()) {
            return $this->json([
                'status' => false,
                'message' => 'Seance exercise not found'
            ], 404);
        }

        return $seanceExercise;
    }

    private function serialize(SeanceExercise $seanceExercise): array
    {
        $exercise = $seanceExercise->getExercise();

        return [
            'id' => $seanceExercise->getId(),
            'position' => $seanceExercise->getPosition(),
            'sets' => $seanceExercise->getSets(),
            'reps' => $seanceExercise->getReps(),
            'comment' => $seanceExercise->getComment(),
            'exercise' => [
                'id' => $exercise->getId(),
                'name' => $exercise->getName(),
                'description' => $exercise->getDescription(),
                'category' => $exercise->getCategory()?->value,
                'level' => $exercise->getLevel()?->value,
                'illustration' => $exercise->getIllustration(),
                'video' => $exercise->getVideo(),
            ],
        ];
    }
}
