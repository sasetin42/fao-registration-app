<?php

namespace App\Controllers;

use App\Services\QRService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class QRController
{
    public function __construct(private QRService $qr) {}

    public function generate(Request $request, Response $response): Response
    {
        $key = $request->getQueryParams()['attendance_key'] ?? '2510061';

        $response->getBody()->write($this->qr->generate($key));

        return $response->withHeader('Content-Type', 'image/png');
    }

    public function generateWithLogo(Request $request, Response $response): Response
    {
        $key = $request->getQueryParams()['attendance_key'] ?? '2510061';

        $response->getBody()->write($this->qr->generateWithLogo($key));

        return $response->withHeader('Content-Type', 'image/png');
    }
}
