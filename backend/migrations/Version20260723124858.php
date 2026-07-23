<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260723124858 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE coach_client (id INT AUTO_INCREMENT NOT NULL, started_at DATETIME NOT NULL, ended_at DATETIME DEFAULT NULL, coach_id INT NOT NULL, client_id INT NOT NULL, INDEX IDX_1CEB4FE03C105691 (coach_id), INDEX IDX_1CEB4FE019EB6921 (client_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE coach_client ADD CONSTRAINT FK_1CEB4FE03C105691 FOREIGN KEY (coach_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE coach_client ADD CONSTRAINT FK_1CEB4FE019EB6921 FOREIGN KEY (client_id) REFERENCES `user` (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE coach_client DROP FOREIGN KEY FK_1CEB4FE03C105691');
        $this->addSql('ALTER TABLE coach_client DROP FOREIGN KEY FK_1CEB4FE019EB6921');
        $this->addSql('DROP TABLE coach_client');
    }
}
