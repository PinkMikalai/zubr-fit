<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Renomme le rôle ROLE_USER en ROLE_CLIENT pour coller au cahier des charges
 * (USER.role {Coach | Client}).
 *
 * La colonne `roles` est du JSON stocké en texte (longtext sur MariaDB, json sur MySQL 8) :
 * un simple REPLACE sur la chaîne suffit et reste du JSON valide, et surtout ça
 * fonctionne aussi bien sur MySQL que sur MariaDB (pas de CAST ... AS JSON).
 */
final class Version20260831162426 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Renomme le rôle ROLE_USER en ROLE_CLIENT sur les comptes existants';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(
            "UPDATE `user` SET roles = REPLACE(roles, 'ROLE_USER', 'ROLE_CLIENT') "
            . "WHERE roles LIKE '%ROLE_USER%'"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            "UPDATE `user` SET roles = REPLACE(roles, 'ROLE_CLIENT', 'ROLE_USER') "
            . "WHERE roles LIKE '%ROLE_CLIENT%'"
        );
    }
}
