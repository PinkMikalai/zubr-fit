<?php

namespace App\Security\Voter;

use App\Entity\User;
use App\Repository\CoachClientRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Décide qui a le droit de consulter le profil d'un autre utilisateur.
 *
 * Règle métier : un coach peut voir le profil d'un client qu'il gère
 * (ou qu'il a géré : l'historique compte, d'où findRelation et non findActiveRelation).
 * Sans ça, n'importe quel utilisateur connecté pourrait lire les coordonnées de
 * n'importe qui en devinant un id dans l'URL.
 *
 * Utilisation dans un contrôleur :
 *   $this->denyAccessUnlessGranted(ClientProfileVoter::VIEW, $targetUser);
 */
class ClientProfileVoter extends Voter
{
    public const VIEW = 'CLIENT_VIEW';

    public function __construct(
        private CoachClientRepository $coachClientRepository,
        private Security $security
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if ($attribute !== self::VIEW) {
            return false;
        }

        return $subject instanceof User;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $coach = $token->getUser();
        if (!$coach instanceof User) {
            return false;
        }

        if (!$this->security->isGranted('ROLE_COACH')) {
            return false;
        }

        return $this->coachClientRepository->findRelation($coach, $subject) !== null;
    }
}
