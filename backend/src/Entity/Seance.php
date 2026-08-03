<?php

namespace App\Entity;

use App\Enum\Level;
use App\Repository\SeanceRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SeanceRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Seance
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank(message: 'Le nom est obligatoire')]
    #[Assert\Length(
        min: 2,
        max: 255,
        minMessage: 'Le nom doit contenir au moins 2 caractères',
        maxMessage: 'Le nom ne peut pas dépasser 255 caractères'
    )]
    private ?string $name = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'La durée est obligatoire')]
    #[Assert\Positive(message: 'La durée doit être positive')]
    private ?int $duration = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    // Pour quel niveau cette séance est prévue (même enum que les exercices)
    #[ORM\Column(enumType: Level::class)]
    #[Assert\NotBlank(message: 'Le niveau est obligatoire')]
    private ?Level $level = null;

    #[ORM\Column(name: 'completed_at', nullable: true)]
    private ?\DateTimeImmutable $completedAt = null;

    #[ORM\Column(name: 'created_at')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(name: 'updated_at')]
    private ?\DateTimeImmutable $updatedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getDuration(): ?int
    {
        return $this->duration;
    }

    public function setDuration(int $duration): static
    {
        $this->duration = $duration;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

        return $this;
    }

    public function getLevel(): ?Level
    {
        return $this->level;
    }

    public function setLevel(Level $level): static
    {
        $this->level = $level;

        return $this;
    }

    public function getCompletedAt(): ?\DateTimeImmutable
    {
        return $this->completedAt;
    }

    public function setCompletedAt(?\DateTimeImmutable $completedAt): static
    {
        $this->completedAt = $completedAt;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}
