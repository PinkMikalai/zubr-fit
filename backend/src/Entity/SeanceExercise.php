<?php

namespace App\Entity;

use App\Repository\SeanceExerciseRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: SeanceExerciseRepository::class)]
class SeanceExercise
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'L\'exercice est obligatoire')]
    private ?Exercise $exercise = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Assert\NotBlank(message: 'La séance est obligatoire')]
    private ?Seance $seance = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'La position est obligatoire')]
    #[Assert\PositiveOrZero(message: 'La position doit être positive ou zéro')]
    private ?int $position = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'Le nombre de séries est obligatoire')]
    #[Assert\Positive(message: 'Le nombre de séries doit être positif')]
    private ?int $sets = null;

    #[ORM\Column]
    #[Assert\NotBlank(message: 'Le nombre de répétitions est obligatoire')]
    #[Assert\Positive(message: 'Le nombre de répétitions doit être positif')]
    private ?int $reps = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $comment = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getExercise(): ?Exercise
    {
        return $this->exercise;
    }

    public function setExercise(?Exercise $exercise): static
    {
        $this->exercise = $exercise;

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

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

        return $this;
    }

    public function getSets(): ?int
    {
        return $this->sets;
    }

    public function setSets(int $sets): static
    {
        $this->sets = $sets;

        return $this;
    }

    public function getReps(): ?int
    {
        return $this->reps;
    }

    public function setReps(int $reps): static
    {
        $this->reps = $reps;

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
}
