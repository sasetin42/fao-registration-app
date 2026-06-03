<?php

use App\Controllers\QRController;
use App\Controllers\RegistrationController;
use App\Models\RegistrationModel;
use App\Services\CodeGenerator;
use App\Services\JwtService;
use App\Services\QRService;
use App\Services\ZoomService;
use App\Services\SupabaseService;
use function DI\autowire;
use function DI\factory;

return [

    mysqli::class => factory(function () {
        $conn = new mysqli(
            trim($_ENV['DB_HOST']),
            trim($_ENV['DB_USER']),
            trim($_ENV['DB_PASS']),
            trim($_ENV['DB_NAME'])
        );
        if ($conn->connect_error) {
            throw new RuntimeException('DB connection failed: ' . $conn->connect_error);
        }
        $conn->set_charset('utf8mb4');
        return $conn;
    }),

    RegistrationModel::class  => autowire(),
    CodeGenerator::class      => autowire(),
    JwtService::class         => autowire(),
    QRService::class          => autowire(),
    ZoomService::class        => autowire(),
    SupabaseService::class    => autowire(),

    QRController::class           => autowire(),
    RegistrationController::class => autowire(),
];
