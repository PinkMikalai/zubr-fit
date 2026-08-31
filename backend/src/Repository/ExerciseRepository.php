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
     * Toute la bibliothèque d'exercices : elle est visible en lecture seule par tout
     * le monde (coach ou client), pas seulement par celui qui les a créés.
     */
    public function findAllDESC(): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.name', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
