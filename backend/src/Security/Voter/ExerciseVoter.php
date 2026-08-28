<?php

namespace App\Security\Voter;

use App\Entity\Exercise;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Décide qui a le droit de voir / modifier / supprimer un exercice.
 *
 * Règle métier : seul le propriétaire (celui qui l'a créé) y a accès.
 *
 * Utilisation dans un contrôleur :
 *   $this->denyAccessUnlessGranted(ExerciseVoter::EDIT, $exercise);
 */
class ExerciseVoter extends Voter
{
    public const VIEW = 'EXERCISE_VIEW';
    public const EDIT = 'EXERCISE_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, [self::VIEW, self::EDIT], true)) {
            return false;
        }

        return $subject instanceof Exercise;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        return $subject->getUser() === $user;
    }
}
