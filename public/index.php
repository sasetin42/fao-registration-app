<?php

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

date_default_timezone_set($_ENV['TIMEZONE'] ?? 'Asia/Manila');

$builder = new ContainerBuilder();
$builder->addDefinitions(__DIR__ . '/../config/container.php');
$container = $builder->build();

AppFactory::setContainer($container);
$app = AppFactory::create();

$app->addBodyParsingMiddleware();
$app->addErrorMiddleware(($_ENV['APP_ENV'] ?? 'production') !== 'production', true, true);

(require __DIR__ . '/../routes/api.php')($app);

$app->run();
