<?php

namespace App\Repository;

use App\Entity\Seance;
use App\Entity\SeanceUser;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Seance>
 */
class SeanceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Seance::class);
    }

    public function findAllByUserDESC(User $user): array
    {
        return $this->createQueryBuilder('s')
            ->innerJoin(SeanceUser::class, 'su', 'WITH', 'su.seance = s.id')
            ->where('su.user = :userId')
            ->setParameter('userId', $user->getId())
            ->orderBy('s.name', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
