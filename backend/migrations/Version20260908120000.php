<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Le statut "terminée" d'une séance passe de la séance elle-même à l'assignation
 * (table seance_user) : si une séance est assignée à plusieurs clients, chacun a
 * désormais son propre statut.
 *
 * On recopie l'existant : chaque ligne seance_user d'une séance déjà terminée
 * hérite de sa date de complétion, puis on supprime la colonne devenue inutile.
 */
final class Version20260908120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Deplace seance.completed_at vers seance_user.completed_at (statut par client)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE seance_user ADD completed_at DATETIME DEFAULT NULL');
        $this->addSql(
            'UPDATE seance_user su INNER JOIN seance s ON s.id = su.seance_id '
            . 'SET su.completed_at = s.completed_at WHERE s.completed_at IS NOT NULL'
        );
        $this->addSql('ALTER TABLE seance DROP completed_at');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE seance ADD completed_at DATETIME DEFAULT NULL');
        $this->addSql(
            'UPDATE seance s INNER JOIN seance_user su ON su.seance_id = s.id '
            . 'SET s.completed_at = su.completed_at WHERE su.completed_at IS NOT NULL'
        );
        $this->addSql('ALTER TABLE seance_user DROP completed_at');
    }
}
