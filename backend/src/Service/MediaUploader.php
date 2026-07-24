<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\Exception\FileException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Mime\MimeTypesInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

class MediaUploader
{
    private const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
    private const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    private const ALLOWED_IMAGE_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    private const ALLOWED_VIDEO_MIME_TYPES = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/3gpp'
    ];

    // Taille de la fenêtre scannée à la recherche de code caché (voir isSuspiciousFile)
    private const SUSPICIOUS_SCAN_WINDOW = 65536; // 64KB

    private const ERROR_CODES = [
        'FILE_TOO_LARGE' => 'FILE_TOO_LARGE',
        'INVALID_FILE_TYPE' => 'INVALID_FILE_TYPE',
        'INVALID_EXTENSION' => 'INVALID_EXTENSION',
        'UPLOAD_FAILED' => 'UPLOAD_FAILED',
        'SECURITY_RISK' => 'SECURITY_RISK'
    ];

    public function __construct(
        private string $avatarsDirectory,
        private SluggerInterface $slugger,
        private MimeTypesInterface $mimeTypes,
        private ?string $illustrationsDirectory = null,
        private ?string $videosDirectory = null
    ) {
    }

    // ==========================================================
    // Upload — méthodes appelées par les contrôleurs
    // ==========================================================

    /**
     * Upload un avatar
     */
    public function uploadAvatar(UploadedFile $file): array
    {
        return $this->uploadFile(
            file: $file,
            directory: $this->avatarsDirectory,
            maxSize: self::MAX_AVATAR_SIZE,
            allowedMimeTypes: self::ALLOWED_IMAGE_MIME_TYPES,
            urlPrefix: '/uploads/avatars/'
        );
    }

    /**
     * Upload une illustration
     */
    public function uploadIllustration(UploadedFile $file): array
    {
        return $this->uploadFile(
            file: $file,
            directory: $this->illustrationsDirectory,
            maxSize: self::MAX_IMAGE_SIZE,
            allowedMimeTypes: self::ALLOWED_IMAGE_MIME_TYPES,
            urlPrefix: '/uploads/illustrations/'
        );
    }

    /**
     * Upload une vidéo de démonstration d'exercice
     */
    public function uploadExerciseVideo(UploadedFile $file): array
    {
        return $this->uploadFile(
            file: $file,
            directory: $this->videosDirectory,
            maxSize: self::MAX_VIDEO_SIZE,
            allowedMimeTypes: self::ALLOWED_VIDEO_MIME_TYPES,
            urlPrefix: '/uploads/videos/'
        );
    }

    // ==========================================================
    // Suppression — méthodes appelées par les contrôleurs
    // ==========================================================

    /**
     * Supprime un avatar
     */
    public function deleteAvatar(?string $filename): bool
    {
        return $this->deleteFile($this->avatarsDirectory, $filename);
    }

    /**
     * Supprime une illustration
     */
    public function deleteIllustration(?string $filename): bool
    {
        return $this->deleteFile($this->illustrationsDirectory, $filename);
    }

    /**
     * Supprime une vidéo d'exercice
     */
    public function deleteVideo(?string $filename): bool
    {
        return $this->deleteFile($this->videosDirectory, $filename);
    }

    // ==========================================================
    // Détails internes — non appelés directement par les contrôleurs
    // ==========================================================

    /**
     * Supprime un fichier sur le disque (utilisée par deleteAvatar/deleteIllustration/deleteVideo)
     */
    private function deleteFile(string $directory, ?string $filename): bool
    {
        if (!$filename) {
            return false;
        }

        $filePath = $directory . '/' . $filename;

        if (file_exists($filePath) && is_file($filePath)) {
            return unlink($filePath);
        }

        return false;
    }

    /**
     * Méthode générique d'upload de fichier (utilisée par uploadAvatar/uploadIllustration/uploadExerciseVideo)
     */
    private function uploadFile(
        UploadedFile $file,
        string $directory,
        int $maxSize,
        array $allowedMimeTypes,
        string $urlPrefix
    ): array {
        $validation = $this->validateFile($file, $maxSize, $allowedMimeTypes);
        if (!$validation['valid']) {
            return [
                'success' => false,
                'error' => $validation['error'],
                'code' => $validation['code']
            ];
        }

        try {
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            // Sauvegarder les infos AVANT de déplacer le fichier
            $fileSize = $file->getSize();
            $fileMimeType = $file->getMimeType();

            $filename = $this->generateUniqueFilename($file);
            $file->move($directory, $filename);

            return [
                'success' => true,
                'filename' => $filename,
                'path' => $urlPrefix . $filename,
                'size' => $fileSize,
                'mimeType' => $fileMimeType
            ];
        } catch (FileException $e) {
            return [
                'success' => false,
                'error' => 'Échec de l\'upload du fichier: ' . $e->getMessage(),
                'code' => self::ERROR_CODES['UPLOAD_FAILED']
            ];
        }
    }

    /**
     * Valide un fichier uploadé
     */
    private function validateFile(UploadedFile $file, int $maxSize, array $allowedMimeTypes): array
    {
        // Vérifier si le fichier est valide (pas d'erreur d'upload)
        if (!$file->isValid()) {
            return [
                'valid' => false,
                'error' => 'Erreur lors de l\'upload: ' . $file->getErrorMessage(),
                'code' => self::ERROR_CODES['UPLOAD_FAILED']
            ];
        }

        // Vérifier que le fichier a un chemin temporaire valide
        $filePath = $file->getPathname();
        if (empty($filePath) || !file_exists($filePath)) {
            return [
                'valid' => false,
                'error' => 'Le fichier est vide ou inexistant. Vérifiez les limites d\'upload PHP (upload_max_filesize, post_max_size).',
                'code' => self::ERROR_CODES['UPLOAD_FAILED']
            ];
        }

        $fileSize = $file->getSize();
        if (!$fileSize || $fileSize === false) {
            return [
                'valid' => false,
                'error' => 'Impossible de lire la taille du fichier. Le fichier est peut-être trop volumineux.',
                'code' => self::ERROR_CODES['FILE_TOO_LARGE']
            ];
        }

        if ($fileSize > $maxSize) {
            return [
                'valid' => false,
                'error' => sprintf(
                    'Fichier trop volumineux (%s MB). Maximum: %s MB',
                    round($fileSize / 1024 / 1024, 1),
                    round($maxSize / 1024 / 1024, 1)
                ),
                'code' => self::ERROR_CODES['FILE_TOO_LARGE']
            ];
        }

        try {
            $mimeType = $file->getMimeType();
        } catch (\Exception $e) {
            return [
                'valid' => false,
                'error' => 'Impossible de déterminer le type de fichier: ' . $e->getMessage(),
                'code' => self::ERROR_CODES['INVALID_FILE_TYPE']
            ];
        }
        if (!in_array($mimeType, $allowedMimeTypes, true)) {
            return [
                'valid' => false,
                'error' => sprintf(
                    'Type de fichier invalide. Types acceptés: %s',
                    implode(', ', $this->getHumanReadableTypes($allowedMimeTypes))
                ),
                'code' => self::ERROR_CODES['INVALID_FILE_TYPE']
            ];
        }

        $guessedExtension = $file->guessExtension();
        $expectedExtensions = $this->mimeTypes->getExtensions($mimeType);

        if (!$guessedExtension || !in_array($guessedExtension, $expectedExtensions, true)) {
            return [
                'valid' => false,
                'error' => 'Extension de fichier invalide ou type MIME incohérent',
                'code' => self::ERROR_CODES['INVALID_EXTENSION']
            ];
        }

        if ($this->isSuspiciousFile($file)) {
            return [
                'valid' => false,
                'error' => 'Fichier potentiellement dangereux détecté',
                'code' => self::ERROR_CODES['SECURITY_RISK']
            ];
        }

        return ['valid' => true];
    }

    /**
     * Génère un nom de fichier unique et sécurisé
     */
    private function generateUniqueFilename(UploadedFile $file): string
    {
        $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $safeFilename = $this->slugger->slug($originalFilename);
        $extension = $file->guessExtension();

        return sprintf(
            '%s-%s.%s',
            $safeFilename ?: 'file',
            uniqid('', true),
            $extension
        );
    }

    /**
     * Convertit les types MIME en noms lisibles
     */
    private function getHumanReadableTypes(array $mimeTypes): array
    {
        $readable = [];
        foreach ($mimeTypes as $mime) {
            $extensions = $this->mimeTypes->getExtensions($mime);
            if (!empty($extensions)) {
                $readable[] = strtoupper($extensions[0]);
            }
        }
        return array_unique($readable);
    }

    /**
     * Détecte les fichiers potentiellement dangereux
     */
    private function isSuspiciousFile(UploadedFile $file): bool
    {
        $filename = $file->getClientOriginalName();

        $dangerousExtensions = [
            'php', 'phtml', 'php3', 'php4', 'php5', 'php7', 'php8', 'pht', 'phar',
            'exe', 'sh', 'bat', 'cgi', 'pl', 'asp', 'aspx', 'jsp', 'js'
        ];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        if (in_array($extension, $dangerousExtensions, true)) {
            return true;
        }

        // Fenêtre plus large que les 1024 premiers octets : une vraie image/vidéo
        // commence par des données binaires, du code caché peut être plus loin dans le fichier.
        $content = file_get_contents($file->getPathname(), false, null, 0, self::SUSPICIOUS_SCAN_WINDOW);
        $lowerContent = strtolower($content);

        $suspiciousPatterns = ['<?php', '<?=', '<script'];
        foreach ($suspiciousPatterns as $pattern) {
            if (str_contains($lowerContent, $pattern)) {
                return true;
            }
        }

        return false;
    }
}
