<?php

namespace App\Repository;

use App\Entity\CoachClient;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CoachClient>
 */
class CoachClientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CoachClient::class);
    }

    public function findActiveByCoach(User $coach): array
    {
        return $this->createQueryBuilder('cc')
            ->where('cc.coach = :coach')
            ->andWhere('cc.endedAt IS NULL')
            ->setParameter('coach', $coach)
            ->orderBy('cc.startedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findHistoryByCoach(User $coach): array
    {
        return $this->createQueryBuilder('cc')
            ->where('cc.coach = :coach')
            ->setParameter('coach', $coach)
            ->orderBy('cc.startedAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    public function findActiveRelation(User $coach, User $client): ?CoachClient
    {
        return $this->createQueryBuilder('cc')
            ->where('cc.coach = :coach')
            ->andWhere('cc.client = :client')
            ->andWhere('cc.endedAt IS NULL')
            ->setParameter('coach', $coach)
            ->setParameter('client', $client)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
