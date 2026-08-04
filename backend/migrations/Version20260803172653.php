<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260803172653 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Rend le niveau (level) obligatoire pour les séances';
    }

    public function up(Schema $schema): void
    {
        // On remplit d'abord les séances existantes sans niveau (sinon la contrainte NOT NULL échoue)
        $this->addSql("UPDATE seance SET level = 'debutant' WHERE level IS NULL");
        $this->addSql('ALTER TABLE seance CHANGE level level VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE seance CHANGE level level VARCHAR(255) DEFAULT NULL');
    }
}
