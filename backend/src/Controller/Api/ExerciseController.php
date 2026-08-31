<?php

namespace App\Controller\Api;

use App\Entity\Exercise;
use App\Entity\User;
use App\Enum\Category;
use App\Enum\Level;
use App\Http\RequestPayload;
use App\Repository\ExerciseRepository;
use App\Repository\SeanceExerciseRepository;
use App\Security\Voter\ExerciseVoter;
use App\Service\MediaUploader;
use App\Service\ValidationService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/exercise', name: 'exercise')]
final class ExerciseController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private ValidationService $validationService,
        private ExerciseRepository $exerciseRepository,
        private MediaUploader $mediaUploader,
        private SeanceExerciseRepository $seanceExerciseRepository
    ) {
    }

    #[Route('/', name: 'exercise_index', methods: ['GET'])]
    public function index(#[CurrentUser] User $user): JsonResponse
    {
        // $user n'est pas utilisé pour filtrer : la bibliothèque est visible par tous
        // les utilisateurs connectés, le paramètre sert juste à imposer l'authentification.
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

    #[Route('/new', name: 'exercise_create', methods: ['POST'])]
    public function create(Request $request, #[CurrentUser] User $user): JsonResponse
    {
        $illustrationFile = $request->files->get('illustration');
        $videoFile = $request->files->get('video');

        $data = RequestPayload::extract($request);

        if (empty($data)) {
            return $this->json([
                'status' => false,
                'data' => null,
                'message' => 'Invalid data'
            ], 400);
        }

        if (!isset($data['name']) || empty($data['name'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le nom est obligatoire'
            ], 400);
        }

        if (!isset($data['description']) || empty($data['description'])) {
            return $this->json([
                'status' => false,
                'message' => 'La description est obligatoire'
            ], 400);
        }

        if (!isset($data['category']) || empty($data['category'])) {
            return $this->json([
                'status' => false,
                'message' => 'La catégorie est obligatoire'
            ], 400);
        }

        if (!isset($data['level']) || empty($data['level'])) {
            return $this->json([
                'status' => false,
                'message' => 'Le niveau est obligatoire'
            ], 400);
        }

        $illustrationFilename = null;
        if ($illustrationFile) {
            $result = $this->mediaUploader->uploadIllustration($illustrationFile);

            if (!$result['success']) {
                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            $illustrationFilename = $result['filename'];
        }

        $videoFilename = null;
        if ($videoFile) {
            $result = $this->mediaUploader->uploadExerciseVideo($videoFile);

            if (!$result['success']) {
                if ($illustrationFilename) {
                    $this->mediaUploader->deleteIllustration($illustrationFilename);
                }

                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            $videoFilename = $result['filename'];
        }

        $exercise = new Exercise();
        $exercise->setName($data['name']);
        $exercise->setDescription($data['description']);

        try {
            $exercise->setCategory(Category::from($data['category']));
            $exercise->setLevel(Level::from($data['level']));
        } catch (\ValueError $e) {
            if ($illustrationFilename) {
                $this->mediaUploader->deleteIllustration($illustrationFilename);
            }
            if ($videoFilename) {
                $this->mediaUploader->deleteVideo($videoFilename);
            }

            return $this->json([
                'status' => false,
                'message' => 'Invalid category or level value',
                'error' => $e->getMessage()
            ], 400);
        }

        $exercise->setIllustration($illustrationFilename);
        $exercise->setVideo($videoFilename);
        $exercise->setUser($user);

        $errorResponse = $this->validationService->getErrorResponse($exercise);
        if ($errorResponse) {
            if ($illustrationFilename) {
                $this->mediaUploader->deleteIllustration($illustrationFilename);
            }
            if ($videoFilename) {
                $this->mediaUploader->deleteVideo($videoFilename);
            }
            return $errorResponse;
        }

        $this->em->persist($exercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => [
                'exercise' => $exercise,
                'illustrationUrl' => $illustrationFilename ? '/uploads/illustrations/' . $illustrationFilename : null,
                'videoUrl' => $videoFilename ? '/uploads/videos/' . $videoFilename : null
            ],
            'message' => 'Exercise created successfully'
        ], 201);
    }

    #[Route('/{id}', name: 'exercise_show', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $this->denyAccessUnlessGranted(ExerciseVoter::VIEW, $exercise, 'Access denied');

        return $this->json([
            'status' => true,
            'data' => $exercise,
            'message' => 'Exercise found'
        ]);
    }

    #[Route('/update/{id}', name: 'exercise_update', methods: ['POST'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $this->denyAccessUnlessGranted(ExerciseVoter::EDIT, $exercise, 'Access denied');

        $illustrationFile = $request->files->get('illustration');
        $videoFile = $request->files->get('video');

        $data = RequestPayload::extract($request);

        if ($illustrationFile) {
            $result = $this->mediaUploader->uploadIllustration($illustrationFile);

            if (!$result['success']) {
                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            $oldIllustration = $exercise->getIllustration();
            if ($oldIllustration) {
                $this->mediaUploader->deleteIllustration($oldIllustration);
            }

            $exercise->setIllustration($result['filename']);
        }

        if ($videoFile) {
            $result = $this->mediaUploader->uploadExerciseVideo($videoFile);

            if (!$result['success']) {
                return $this->json([
                    'status' => false,
                    'message' => $result['error'],
                    'code' => $result['code']
                ], 400);
            }

            $oldVideo = $exercise->getVideo();
            if ($oldVideo) {
                $this->mediaUploader->deleteVideo($oldVideo);
            }

            $exercise->setVideo($result['filename']);
        }

        if (isset($data['name'])) {
            $exercise->setName($data['name']);
        }

        if (isset($data['description'])) {
            $exercise->setDescription($data['description']);
        }

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

        $errorResponse = $this->validationService->getErrorResponse($exercise);
        if ($errorResponse) {
            return $errorResponse;
        }

        $this->em->flush();

        return $this->json([
            'status' => true,
            'data' => [
                'exercise' => $exercise,
                'illustrationUrl' => $exercise->getIllustration() ? '/uploads/illustrations/' . $exercise->getIllustration() : null,
                'videoUrl' => $exercise->getVideo() ? '/uploads/videos/' . $exercise->getVideo() : null
            ],
            'message' => 'Exercise updated successfully'
        ]);
    }

    #[Route('/{id}', name: 'exercise_delete', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $exercise = $this->em->getRepository(Exercise::class)->find($id);

        if (!$exercise) {
            return $this->json([
                'status' => false,
                'message' => 'Exercise not found'
            ], 404);
        }

        $this->denyAccessUnlessGranted(ExerciseVoter::EDIT, $exercise, 'Access denied');

        // Contrairement à la suppression d'une séance (où les lignes lui appartiennent),
        // un exercice est partagé par plusieurs séances : le supprimer en cascade retirerait
        // silencieusement du contenu à des séances (potentiellement déjà assignées à des clients).
        // On bloque donc la suppression tant que l'exercice est utilisé quelque part.
        $usageCount = $this->seanceExerciseRepository->count(['exercise' => $exercise]);
        if ($usageCount > 0) {
            return $this->json([
                'status' => false,
                'message' => "Cet exercice est utilisé dans $usageCount séance(s). Retire-le de ces séances avant de le supprimer."
            ], 409);
        }

        if ($exercise->getIllustration()) {
            $this->mediaUploader->deleteIllustration($exercise->getIllustration());
        }

        if ($exercise->getVideo()) {
            $this->mediaUploader->deleteVideo($exercise->getVideo());
        }

        $this->em->remove($exercise);
        $this->em->flush();

        return $this->json([
            'status' => true,
            'message' => 'Exercise deleted successfully'
        ]);
    }
}
