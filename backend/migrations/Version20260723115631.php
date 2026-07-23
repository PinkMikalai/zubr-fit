<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260723115631 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE seance_user (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, seance_id INT NOT NULL, INDEX IDX_4103F49AA76ED395 (user_id), INDEX IDX_4103F49AE3797A94 (seance_id), UNIQUE INDEX UNIQ_SEANCE_USER (seance_id, user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE seance_user ADD CONSTRAINT FK_4103F49AA76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)');
        $this->addSql('ALTER TABLE seance_user ADD CONSTRAINT FK_4103F49AE3797A94 FOREIGN KEY (seance_id) REFERENCES seance (id)');
        $this->addSql('INSERT INTO seance_user (user_id, seance_id, created_at) SELECT us.user_id, us.seance_id, s.created_at FROM user_seance us INNER JOIN seance s ON s.id = us.seance_id');
        $this->addSql('ALTER TABLE user_seance DROP FOREIGN KEY `FK_BA2FE633A76ED395`');
        $this->addSql('ALTER TABLE user_seance DROP FOREIGN KEY `FK_BA2FE633E3797A94`');
        $this->addSql('DROP TABLE user_seance');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_seance (user_id INT NOT NULL, seance_id INT NOT NULL, INDEX IDX_BA2FE633A76ED395 (user_id), INDEX IDX_BA2FE633E3797A94 (seance_id), PRIMARY KEY (user_id, seance_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE user_seance ADD CONSTRAINT `FK_BA2FE633A76ED395` FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_seance ADD CONSTRAINT `FK_BA2FE633E3797A94` FOREIGN KEY (seance_id) REFERENCES seance (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('INSERT INTO user_seance (user_id, seance_id) SELECT user_id, seance_id FROM seance_user');
        $this->addSql('ALTER TABLE seance_user DROP FOREIGN KEY FK_4103F49AA76ED395');
        $this->addSql('ALTER TABLE seance_user DROP FOREIGN KEY FK_4103F49AE3797A94');
        $this->addSql('DROP TABLE seance_user');
    }
}
