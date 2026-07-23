<?php

namespace App\Entity;

use App\Repository\SeanceUserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SeanceUserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_SEANCE_USER', fields: ['seance', 'user'])]
#[ORM\HasLifecycleCallbacks]
class SeanceUser
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'L\'utilisateur est obligatoire')]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Seance::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'La séance est obligatoire')]
    private ?Seance $seance = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $createdAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getSeance(): ?Seance
    {
        return $this->seance;
    }

    public function setSeance(?Seance $seance): static
    {
        $this->seance = $seance;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    #[ORM\PrePersist]
    public function setCreatedAtValue(): void
    {
        $this->createdAt = new \DateTimeImmutable();
    }
}
