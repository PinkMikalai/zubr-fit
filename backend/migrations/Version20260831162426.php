<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Renomme le rôle ROLE_USER en ROLE_CLIENT pour coller au cahier des charges
 * (USER.role {Coach | Client}).
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
            "UPDATE `user` SET roles = CAST(REPLACE(CAST(roles AS CHAR), 'ROLE_USER', 'ROLE_CLIENT') AS JSON) "
            . "WHERE CAST(roles AS CHAR) LIKE '%ROLE_USER%'"
        );
    }

    public function down(Schema $schema): void
    {
        $this->addSql(
            "UPDATE `user` SET roles = CAST(REPLACE(CAST(roles AS CHAR), 'ROLE_CLIENT', 'ROLE_USER') AS JSON) "
            . "WHERE CAST(roles AS CHAR) LIKE '%ROLE_CLIENT%'"
        );
    }
}
