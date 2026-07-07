<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;


#[Route('/auth', name: 'auth')]
class AuthController extends AbstractController
{
    //inscription
    #[Route('/register', name: 'register', methods: ['POST'])]
    public function register(): JsonResponse
    {
        return $this->json([
            "message" => "Hello World",
        ]);
    }
    //connexion
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        return $this->json([
            "message" => "Hello World",
        ]);
    }
    //deconnexion
    #[Route('/logout', name: 'logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        return $this->json([
            "message" => "Hello World",
        ]);
    }
}
