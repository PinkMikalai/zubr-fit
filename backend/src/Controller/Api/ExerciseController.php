<?php

namespace App\Controller\Api;

use App\Entity\Exercise;
use App\Entity\User;
use App\Enum\Category;
use App\Enum\Level;
use App\Repository\ExerciseRepository;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/exercise', name: 'exercise')]
final class ExerciseController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private ExerciseRepository $exerciseRepository
    ) {
    }

    #[Route('/', name: 'exercise_index', methods: ['GET'])]
    public function index(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $data = $this->exerciseRepository->findAllDESC();

        if (!$data) {
            return $this->json([
                'status' => false,
                'data' => null,
                'message' => 'No exercises found'
            ]);
        }

        return $this->json([
            'status' => true,
            'data' => $data,
            'message' => 'Exercises fetched successfully'
        ]);
    }

    #[Route('/', name: 'exercise_create', methods: ['POST'])]
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

        $exercise = new Exercise();
        $exercise->setName($data['name'] ?? '');
        $exercise->setDescription($data['description'] ?? '');
        
        // Gestion des Enums
        try {
            if (isset($data['category'])) {
                $exercise->setCategory(Category::from($data['category']));
            }
            if (isset($data['level'])) {
                $exercise->setLevel(Level::from($data['level']));
            }
        } catch (\ValueError $e) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid category or level value',
                'error' => $e->getMessage()
            ], 400);
        }
        
        $exercise->setIllustration($data['illustration'] ?? null);
        $exercise->setVideo($data['video'] ?? null);

        $errorResponse = $this->validationService->getErrorResponse($exercise);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->persist($exercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $exercise,
            'message' => 'Exercise created successfully'
        ], 201);
    }

    #[Route('/{id}', name: 'exercise_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        return $this->json([
            'status' => true,
            'data' => $exercise,
            'message' => 'Exercise found'
        ]);
    }

    #[Route('/{id}', name: 'exercise_update', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!$data) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid JSON data'
            ], 400);
        }

        $exercise->setName($data['name'] ?? $exercise->getName());
        $exercise->setDescription($data['description'] ?? $exercise->getDescription());
        
        // Gestion des Enums
        try {
            if (isset($data['category'])) {
                $exercise->setCategory(Category::from($data['category']));
            }
            if (isset($data['level'])) {
                $exercise->setLevel(Level::from($data['level']));
            }
        } catch (\ValueError $e) {
            return $this->json([
                'status' => false,
                'message' => 'Invalid category or level value',
                'error' => $e->getMessage()
            ], 400);
        }
        
        $exercise->setIllustration($data['illustration'] ?? $exercise->getIllustration());
        $exercise->setVideo($data['video'] ?? $exercise->getVideo());

        $errorResponse = $this->validationService->getErrorResponse($exercise);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => $exercise,
            'message' => 'Exercise updated successfully'
        ]);
    }

    #[Route('/{id}', name: 'exercise_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return $this->json([
                'status' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $this->em->remove($exercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'message' => 'Exercise deleted successfully'
        ]);
    }
}
