<?php

use App\Controllers\QRController;
use App\Controllers\RegistrationController;
use App\Controllers\AdminController;
use App\Services\JwtService;
use Slim\App;
use Slim\Routing\RouteCollectorProxy;

return function (App $app): void {

    $app->get('/', function ($request, $response) {
        return $response->withHeader('Location', '/fao_registration')->withStatus(302);
    });

    $app->get('/fao_registration', function ($request, $response) {
        return $response->withHeader('Location', '/pages/registration.php')->withStatus(302);
    });

    $app->get('/confirmation', function ($request, $response) {
        return $response->withHeader('Location', '/pages/confirmation.php')->withStatus(302);
    });

    $app->get('/admin', function ($request, $response) {
        return $response->withHeader('Location', '/pages/admin-login.php')->withStatus(302);
    });

    $app->get('/favicon.ico', function ($request, $response) {
        return $response->withHeader('Location', '/assets/favicon.ico')->withStatus(302);
    });

    $app->group('/v1', function (RouteCollectorProxy $v1) {

        $v1->get('/qr',      [QRController::class, 'generate']);
        $v1->get('/qr/logo', [QRController::class, 'generateWithLogo']);


        $v1->post('/register',       [RegistrationController::class, 'register']);
        $v1->post('/validate-email', [RegistrationController::class, 'validateEmail']);
        $v1->post('/refresh-status', [RegistrationController::class, 'refreshStatus']);
        $v1->get('/zoom-meetings',   [RegistrationController::class, 'getActiveMeetings']);

        // Admin Routes
        $v1->group('/admin', function (RouteCollectorProxy $admin) {
            $admin->post('/login', [AdminController::class, 'login']);

            // Protected admin routes
            $admin->group('', function (RouteCollectorProxy $protected) {
                $protected->get('/stats', [AdminController::class, 'getStats']);
                $protected->get('/registrations', [AdminController::class, 'getRegistrations']);
                $protected->put('/registrations/batch-status', [AdminController::class, 'batchUpdateStatus']);
                $protected->post('/registrations/batch-delete', [AdminController::class, 'batchDelete']);
                $protected->put('/registrations/{id}/status', [AdminController::class, 'updateStatus']);
                $protected->delete('/registrations/{id}', [AdminController::class, 'deleteRegistration']);
                
                // Zoom Integration Routes
                $protected->get('/zoom/settings', [AdminController::class, 'getZoomSettings']);
                $protected->post('/zoom/settings', [AdminController::class, 'updateZoomSettings']);
                $protected->get('/zoom/meetings', [AdminController::class, 'getLiveZoomMeetings']);
                $protected->get('/zoom/meetings/{meetingId}', [AdminController::class, 'getLiveMeetingDetails']);
                $protected->get('/zoom/config', [AdminController::class, 'getConfigMeetings']);
                $protected->post('/zoom/config', [AdminController::class, 'saveConfigMeeting']);
                $protected->delete('/zoom/config/{meetingId}', [AdminController::class, 'deleteConfigMeeting']);
            })->add(function ($request, $handler) {
                $response = new \Slim\Psr7\Response();
                $header = $request->getHeaderLine('Authorization');
                if (empty($header) || !preg_match('/Bearer\s+(.*)$/i', $header, $matches)) {
                    $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
                }
                
                try {
                    $jwtService = new JwtService();
                    $decoded = $jwtService->decode($matches[1]);
                    if (!isset($decoded->role) || $decoded->role !== 'admin') {
                        throw new \Exception('Invalid role');
                    }
                } catch (\Exception $e) {
                    $response->getBody()->write(json_encode(['error' => 'Unauthorized']));
                    return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
                }

                return $handler->handle($request);
            });
        });
    });

};
