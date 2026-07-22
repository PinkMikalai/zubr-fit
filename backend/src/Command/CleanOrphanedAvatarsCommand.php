<?php

namespace App\Command;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:clean-orphaned-avatars',
    description: 'Supprime les fichiers avatars orphelins (non référencés en base de données)'
)]
class CleanOrphanedAvatarsCommand extends Command
{
    public function __construct(
        private EntityManagerInterface $em,
        private string $avatarsDirectory
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $io->title('Nettoyage des avatars orphelins');

        // Récupérer tous les avatars en BDD
        $query = $this->em->getConnection()->executeQuery('SELECT avatar FROM user WHERE avatar IS NOT NULL');
        $avatarsInDb = array_column($query->fetchAllAssociative(), 'avatar');

        $io->info(sprintf('Avatars en base de données : %d', count($avatarsInDb)));

        // Lister tous les fichiers du dossier
        $files = array_diff(scandir($this->avatarsDirectory), ['.', '..', '.gitignore']);
        
        $io->info(sprintf('Fichiers dans le dossier : %d', count($files)));

        // Trouver les fichiers orphelins
        $orphanedFiles = array_diff($files, $avatarsInDb);

        if (empty($orphanedFiles)) {
            $io->success('Aucun fichier orphelin trouvé !');
            return Command::SUCCESS;
        }

        $io->warning(sprintf('%d fichier(s) orphelin(s) trouvé(s)', count($orphanedFiles)));

        $io->listing($orphanedFiles);

        if (!$io->confirm('Voulez-vous supprimer ces fichiers ?', false)) {
            $io->note('Opération annulée.');
            return Command::SUCCESS;
        }

        // Supprimer les fichiers
        $deleted = 0;
        $failed = 0;

        foreach ($orphanedFiles as $file) {
            $filePath = $this->avatarsDirectory . '/' . $file;
            
            if (is_file($filePath)) {
                if (unlink($filePath)) {
                    $deleted++;
                    $io->text('✓ Supprimé : ' . $file);
                } else {
                    $failed++;
                    $io->error('✗ Échec : ' . $file);
                }
            }
        }

        $io->success(sprintf(
            'Nettoyage terminé ! %d supprimé(s), %d échec(s)',
            $deleted,
            $failed
        ));

        return Command::SUCCESS;
    }
}
