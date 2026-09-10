<?php

namespace App\Repository;

use App\Entity\Exercise;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Exercise>
 */
class ExerciseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Exercise::class);
    }

    /**
     * Les exercices créés par un coach donné. La bibliothèque n'est PAS partagée :
     * chaque coach ne voit et n'utilise que ses propres exercices.
     */
    public function findAllByUserDESC(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->orderBy('e.name', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
