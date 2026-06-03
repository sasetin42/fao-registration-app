<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\RegistrationModel;
use App\Services\JwtService;
use App\Services\ZoomService;

class AdminController
{
    private string $settingsFilePath;
    private string $meetingsFilePath;

    public function __construct(
        private RegistrationModel $registrationModel,
        private JwtService $jwt,
        private ZoomService $zoomService
    ) {
        $this->settingsFilePath = __DIR__ . '/../../config/zoom_settings.json';
        $this->meetingsFilePath = __DIR__ . '/../../config/zoom_meetings.json';
    }

    public function login(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $adminUser = $_ENV['ADMIN_USER'] ?? 'admin';
        $adminPass = $_ENV['ADMIN_PASS'] ?? 'admin123';

        if ($username === $adminUser && $password === $adminPass) {
            $token = $this->jwt->generate(['role' => 'admin', 'exp' => time() + (86400 * 7)]); // 7 days expiration
            
            $payload = json_encode(['success' => true, 'token' => $token]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $payload = json_encode(['success' => false, 'message' => 'Invalid credentials']);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }

    public function getStats(Request $request, Response $response): Response
    {
        $registrations = $this->registrationModel->getAllRegistrations();
        
        $stats = [
            'total' => count($registrations),
            'approved' => 0,
            'pending' => 0,
            'rejected' => 0,
            'inPerson' => 0,
            'virtual' => 0
        ];

        foreach ($registrations as $r) {
            if (isset($r['approval_status'])) {
                if ((int)$r['approval_status'] === 1) $stats['approved']++;
                elseif ((int)$r['approval_status'] === -1) $stats['rejected']++;
                else $stats['pending']++;
            }
            if (isset($r['attendance_mode'])) {
                if ($r['attendance_mode'] === 'in-person') $stats['inPerson']++;
                if ($r['attendance_mode'] === 'online') $stats['virtual']++;
            }
        }

        $payload = json_encode(['success' => true, 'data' => $stats]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getRegistrations(Request $request, Response $response): Response
    {
        $registrations = $this->registrationModel->getAllRegistrations();
        
        $payload = json_encode(['success' => true, 'data' => $registrations]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateStatus(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $data = $request->getParsedBody() ?? [];
        $status = isset($data['status']) ? (int)$data['status'] : 0;

        $success = $this->registrationModel->updateApprovalStatus($id, $status);
        
        $payload = json_encode(['success' => $success]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($success ? 200 : 400);
    }

    public function deleteRegistration(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $success = $this->registrationModel->deleteRegistration($id);

        $payload = json_encode(['success' => $success]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($success ? 200 : 400);
    }

    // === ZOOM SETTINGS MANAGEMENT ===

    public function getZoomSettings(Request $request, Response $response): Response
    {
        $settings = [];
        if (file_exists($this->settingsFilePath)) {
            $settings = json_decode(file_get_contents($this->settingsFilePath), true) ?? [];
        }
        
        // Fallback to env values if json is empty
        if (empty($settings)) {
            $settings = [
                'account_id' => $_ENV['ZOOM_ACCOUNT_ID'] ?? '',
                'client_id' => $_ENV['ZOOM_CLIENT_ID'] ?? '',
                'client_secret' => $_ENV['ZOOM_CLIENT_SECRET'] ?? '',
                'secret_token' => $_ENV['ZOOM_SECRET_TOKEN'] ?? ''
            ];
        }

        // Mask sensitive info for safety (but allow showing partial/full in setting fields)
        $payload = json_encode(['success' => true, 'data' => $settings]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function updateZoomSettings(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];
        
        $settings = [
            'account_id' => trim($data['account_id'] ?? ''),
            'client_id' => trim($data['client_id'] ?? ''),
            'client_secret' => trim($data['client_secret'] ?? ''),
            'secret_token' => trim($data['secret_token'] ?? '')
        ];

        $success = file_put_contents($this->settingsFilePath, json_encode($settings, JSON_PRETTY_PRINT)) !== false;

        $payload = json_encode(['success' => $success]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($success ? 200 : 400);
    }

    // === LIVE ZOOM MEETINGS FROM ZOOM API ===

    public function getLiveZoomMeetings(Request $request, Response $response): Response
    {
        $meetings = $this->zoomService->listMeetings();
        
        $payload = json_encode(['success' => true, 'data' => $meetings]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function getLiveMeetingDetails(Request $request, Response $response, array $args): Response
    {
        $meetingId = $args['meetingId'];
        
        $details = $this->zoomService->getMeetingDetails($meetingId);
        if (!$details || isset($details['error'])) {
            $msg = $details['error'] ?? 'Meeting not found or API error';
            $payload = json_encode(['success' => false, 'message' => $msg]);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
        }

        $registrants = $this->zoomService->getMeetingRegistrants($meetingId);
        $participants = $this->zoomService->getMeetingParticipants($meetingId);

        $payload = json_encode([
            'success' => true,
            'data' => [
                'details' => $details,
                'registrants' => $registrants,
                'participants' => $participants
            ]
        ]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    // === CONFIGURED MEETINGS (FOR DROPDOWN SELECT) ===

    public function getConfigMeetings(Request $request, Response $response): Response
    {
        $meetings = [];
        if (file_exists($this->meetingsFilePath)) {
            $meetings = json_decode(file_get_contents($this->meetingsFilePath), true) ?? [];
        }

        $payload = json_encode(['success' => true, 'data' => $meetings]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }

    public function saveConfigMeeting(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody() ?? [];
        $meetingId = trim($data['meeting_id'] ?? '');
        $topic = trim($data['topic'] ?? '');
        $displayName = trim($data['display_name'] ?? '');
        $isActive = isset($data['is_active']) ? (bool)$data['is_active'] : true;

        if (empty($meetingId) || empty($topic)) {
            $payload = json_encode(['success' => false, 'message' => 'Meeting ID and Topic are required.']);
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $meetings = [];
        if (file_exists($this->meetingsFilePath)) {
            $meetings = json_decode(file_get_contents($this->meetingsFilePath), true) ?? [];
        }

        // Upsert logic
        $found = false;
        foreach ($meetings as &$m) {
            if ($m['meeting_id'] === $meetingId) {
                $m['topic'] = $topic;
                $m['display_name'] = !empty($displayName) ? $displayName : "{$topic} ({$meetingId})";
                $m['is_active'] = $isActive;
                $found = true;
                break;
            }
        }

        if (!$found) {
            $meetings[] = [
                'meeting_id' => $meetingId,
                'topic' => $topic,
                'display_name' => !empty($displayName) ? $displayName : "{$topic} ({$meetingId})",
                'is_active' => $isActive
            ];
        }

        $success = file_put_contents($this->meetingsFilePath, json_encode($meetings, JSON_PRETTY_PRINT)) !== false;

        $payload = json_encode(['success' => $success]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($success ? 200 : 400);
    }

    public function deleteConfigMeeting(Request $request, Response $response, array $args): Response
    {
        $meetingId = $args['meetingId'];

        $meetings = [];
        if (file_exists($this->meetingsFilePath)) {
            $meetings = json_decode(file_get_contents($this->meetingsFilePath), true) ?? [];
        }

        $filtered = array_filter($meetings, function ($m) use ($meetingId) {
            return $m['meeting_id'] !== $meetingId;
        });

        // Re-index array
        $filtered = array_values($filtered);

        $success = file_put_contents($this->meetingsFilePath, json_encode($filtered, JSON_PRETTY_PRINT)) !== false;

        $payload = json_encode(['success' => $success]);
        $response->getBody()->write($payload);
        return $response->withHeader('Content-Type', 'application/json')->withStatus($success ? 200 : 400);
    }
}
