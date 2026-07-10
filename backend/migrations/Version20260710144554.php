<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260710144554 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_seance (user_id INT NOT NULL, seance_id INT NOT NULL, INDEX IDX_BA2FE633A76ED395 (user_id), INDEX IDX_BA2FE633E3797A94 (seance_id), PRIMARY KEY (user_id, seance_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE user_seance ADD CONSTRAINT FK_BA2FE633A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_seance ADD CONSTRAINT FK_BA2FE633E3797A94 FOREIGN KEY (seance_id) REFERENCES seance (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE user_seance DROP FOREIGN KEY FK_BA2FE633A76ED395');
        $this->addSql('ALTER TABLE user_seance DROP FOREIGN KEY FK_BA2FE633E3797A94');
        $this->addSql('DROP TABLE user_seance');
    }
}
