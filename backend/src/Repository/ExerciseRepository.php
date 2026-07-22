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

    public function findAllByUserDESC(User $user): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.name', 'DESC')
            ->where('e.user = :user')
            ->setParameter('user', $user)
            ->getQuery()
            ->getResult();
    }
}
