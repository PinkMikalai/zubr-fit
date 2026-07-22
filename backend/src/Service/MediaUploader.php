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
        'image/webp',
        'image/svg+xml'
    ];

    private const ALLOWED_VIDEO_MIME_TYPES = [
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo'
    ];

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

    /**
     * Upload un avatar (alias pour uploadImage avec contraintes spécifiques)
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
     * Upload une image générique
     */
    public function uploadImage(UploadedFile $file, string $directory, string $urlPrefix = '/uploads/'): array
    {
        return $this->uploadFile(
            file: $file,
            directory: $directory,
            maxSize: self::MAX_IMAGE_SIZE,
            allowedMimeTypes: self::ALLOWED_IMAGE_MIME_TYPES,
            urlPrefix: $urlPrefix
        );
    }

    /**
     * Upload une illustration (alias pour uploadImage avec répertoire par défaut)
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
     * Upload une vidéo
     */
    public function uploadVideo(UploadedFile $file, string $directory, string $urlPrefix = '/uploads/'): array
    {
        return $this->uploadFile(
            file: $file,
            directory: $directory,
            maxSize: self::MAX_VIDEO_SIZE,
            allowedMimeTypes: self::ALLOWED_VIDEO_MIME_TYPES,
            urlPrefix: $urlPrefix
        );
    }

    /**
     * Upload une vidéo d'exercice (alias pour uploadVideo avec répertoire par défaut)
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

    /**
     * Méthode générique d'upload de fichier
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
        if ($file->getSize() > $maxSize) {
            return [
                'valid' => false,
                'error' => sprintf(
                    'Fichier trop volumineux. Taille maximale: %s MB',
                    round($maxSize / 1024 / 1024, 1)
                ),
                'code' => self::ERROR_CODES['FILE_TOO_LARGE']
            ];
        }

        $mimeType = $file->getMimeType();
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
        
        $dangerousExtensions = ['php', 'phtml', 'php3', 'php4', 'php5', 'exe', 'sh', 'bat', 'js'];
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        
        if (in_array($extension, $dangerousExtensions, true)) {
            return true;
        }

        $content = file_get_contents($file->getPathname(), false, null, 0, 1024);
        if (str_contains($content, '<?php') || str_contains($content, '<script')) {
            return true;
        }

        return false;
    }

    /**
     * Supprime un fichier
     */
    public function deleteFile(string $directory, ?string $filename): bool
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
     * Supprime un avatar (alias pour deleteFile)
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
     * Supprime une vidéo
     */
    public function deleteVideo(?string $filename): bool
    {
        return $this->deleteFile($this->videosDirectory, $filename);
    }

    /**
     * Retourne l'URL complète d'un avatar
     */
    public function getAvatarUrl(?string $filename): ?string
    {
        if (!$filename) {
            return null;
        }

        return '/uploads/avatars/' . $filename;
    }

    /**
     * Vérifie si un fichier existe
     */
    public function fileExists(string $directory, ?string $filename): bool
    {
        if (!$filename) {
            return false;
        }

        return file_exists($directory . '/' . $filename) && is_file($directory . '/' . $filename);
    }

    /**
     * Vérifie si un avatar existe (alias pour fileExists)
     */
    public function avatarExists(?string $filename): bool
    {
        return $this->fileExists($this->avatarsDirectory, $filename);
    }

    /**
     * Retourne les informations d'un fichier
     */
    public function getFileInfo(string $directory, string $filename): ?array
    {
        $filePath = $directory . '/' . $filename;

        if (!$this->fileExists($directory, $filename)) {
            return null;
        }

        return [
            'filename' => $filename,
            'size' => filesize($filePath),
            'mimeType' => mime_content_type($filePath),
            'lastModified' => filemtime($filePath)
        ];
    }
}
