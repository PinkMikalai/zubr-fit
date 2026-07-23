<?php

namespace App\Entity;

use App\Repository\CoachClientRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CoachClientRepository::class)]
#[ORM\HasLifecycleCallbacks]
class CoachClient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'Le coach est obligatoire')]
    private ?User $coach = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'Le client est obligatoire')]
    private ?User $client = null;

    #[ORM\Column(name: 'started_at')]
    private ?\DateTimeImmutable $startedAt = null;

    #[ORM\Column(name: 'ended_at', nullable: true)]
    private ?\DateTimeImmutable $endedAt = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCoach(): ?User
    {
        return $this->coach;
    }

    public function setCoach(?User $coach): static
    {
        $this->coach = $coach;

        return $this;
    }

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): static
    {
        $this->client = $client;

        return $this;
    }

    public function getStartedAt(): ?\DateTimeImmutable
    {
        return $this->startedAt;
    }

    public function getEndedAt(): ?\DateTimeImmutable
    {
        return $this->endedAt;
    }

    public function setEndedAt(?\DateTimeImmutable $endedAt): static
    {
        $this->endedAt = $endedAt;

        return $this;
    }

    public function isActive(): bool
    {
        return $this->endedAt === null;
    }

    #[ORM\PrePersist]
    public function setStartedAtValue(): void
    {
        $this->startedAt = new \DateTimeImmutable();
    }
}
