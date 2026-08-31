<?php

namespace App\Security\Voter;

use App\Entity\Seance;
use App\Entity\User;
use App\Repository\SeanceUserRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Décide qui a le droit de voir / modifier / assigner une séance.
 *
 * Règle métier : on est autorisé si on est "lié" à la séance, c'est-à-dire soit son
 * créateur, soit une personne à qui elle a été assignée (table seance_user).
 * Pour ASSIGN (assigner/désassigner des clients), il faut EN PLUS être coach.
 *
 * Utilisation dans un contrôleur :
 *   $this->denyAccessUnlessGranted(SeanceVoter::EDIT, $seance);
 */
class SeanceVoter extends Voter
{
    public const VIEW = 'SEANCE_VIEW';
    public const EDIT = 'SEANCE_EDIT';
    public const ASSIGN = 'SEANCE_ASSIGN';
    public const COMPLETE = 'SEANCE_COMPLETE';

    public function __construct(
        private SeanceUserRepository $seanceUserRepository,
        private Security $security
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT, self::ASSIGN, self::COMPLETE], true)) {
            return false;
        }

        return $subject instanceof Seance;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        // Modifier le contenu / supprimer / assigner une séance : réservé aux coachs.
        if (in_array($attribute, [self::EDIT, self::ASSIGN], true) && !$this->security->isGranted('ROLE_COACH')) {
            return false;
        }

        // Marquer une séance comme terminée : réservé aux clients (donc interdit aux coachs,
        // même si le coach créateur est lui aussi "lié" à sa propre séance).
        if ($attribute === self::COMPLETE && $this->security->isGranted('ROLE_COACH')) {
            return false;
        }

        // Dans tous les cas, il faut être lié à la séance.
        return $this->seanceUserRepository->count(['seance' => $subject, 'user' => $user]) > 0;
    }
}
