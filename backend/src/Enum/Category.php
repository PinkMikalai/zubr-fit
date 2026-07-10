<?php

namespace App\Enum;

enum Category: string
{
    case MUSCULATION = 'musculation';
    case CARDIO = 'cardio';
    case MOBILITE = 'mobilite';
    case FONCTIONNEL = 'fonctionnel';
    case AUTRE = 'autre';
}
