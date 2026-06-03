<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtService
{
    private string $secret;
    private string $algo;
    private string $issuer;

    public function __construct()
    {
        $this->secret = $_ENV['JWT_SECRET'];
        $this->algo   = $_ENV['JWT_ALGO']   ?? 'HS512';
        $this->issuer = $_ENV['JWT_ISSUER'] ?? 'localhost';
    }

    public function generate(array $payload): string
    {
        $now = new \DateTimeImmutable();

        return JWT::encode(array_merge([
            'iat' => $now->getTimestamp(),
            'nbf' => $now->getTimestamp(),
            'iss' => $this->issuer,
        ], $payload), $this->secret, $this->algo);
    }

    public function decode(string $token): object
    {
        return JWT::decode($token, new Key($this->secret, $this->algo));
    }
}
