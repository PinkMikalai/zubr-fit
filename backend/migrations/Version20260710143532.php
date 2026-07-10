<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260710143532 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE seance_exercise (id INT AUTO_INCREMENT NOT NULL, position INT NOT NULL, sets INT NOT NULL, reps INT NOT NULL, comment LONGTEXT DEFAULT NULL, exercise_id INT NOT NULL, seance_id INT NOT NULL, INDEX IDX_42615564E934951A (exercise_id), INDEX IDX_42615564E3797A94 (seance_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE seance_exercise ADD CONSTRAINT FK_42615564E934951A FOREIGN KEY (exercise_id) REFERENCES exercise (id)');
        $this->addSql('ALTER TABLE seance_exercise ADD CONSTRAINT FK_42615564E3797A94 FOREIGN KEY (seance_id) REFERENCES seance (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE seance_exercise DROP FOREIGN KEY FK_42615564E934951A');
        $this->addSql('ALTER TABLE seance_exercise DROP FOREIGN KEY FK_42615564E3797A94');
        $this->addSql('DROP TABLE seance_exercise');
    }
}
