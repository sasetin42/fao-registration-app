<?php

namespace App\Controllers;

use App\Models\RegistrationModel;
use App\Services\CodeGenerator;
use App\Services\JwtService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Services\ZoomService;
use App\Services\SupabaseService;

class RegistrationController
{
    public function __construct(
        private RegistrationModel $model,
        private CodeGenerator     $codes,
        private JwtService        $jwt,
        private ZoomService       $zoom,
        private SupabaseService   $supabase
    ) {}

    public function register(Request $request, Response $response): Response
    {
        $body = (array) $request->getParsedBody();

        $fields = [
            'registration_type', 'prefix', 'speaker_type',
            'first_name', 'middle_initial', 'last_name', 'suffix', 'full_name',
            'age_range', 'gender', 'nationality',
            'affiliation', 'affiliation_sub', 'affiliation_specify',
            'designation', 'media_queries', 'company',
            'email', 'phone',
            'address_country', 'address_state', 'address_street', 'address_city', 'address_zip',
            'dietary', 'dietary_details', 'academic_type',
            'attendance_mode', 'attendance_days', 'visa_assistance', 'field_trip', 'seminar', 'zoom_meeting_id',
        ];

        $data = [];
        foreach ($fields as $field) {
            $data[$field] = isset($body[$field]) ? htmlspecialchars(trim($body[$field]), ENT_QUOTES, 'UTF-8') : null;
        }

        if (empty($data['email'])) {
            return $this->error($response, "Email address is required.");
        }

        if ($this->model->emailExists($data['email'])) {
            return $this->error($response, "This email address is already registered. Please use a different email.");
        }

        try {
            $result = $this->model->addParticipant($data);

            if ($result['affected_rows'] < 1) {
                return $this->error($response, "We couldn't process your registration. Please try again.");
            }

            $userId        = $result['user_id'];
            $visitorCode   = $this->codes->generateVisitorCode($userId, 'FAO');
            $attendanceKey = $this->codes->generateAttendanceKey($userId);

            $this->model->addAttendanceKey($userId, $visitorCode, $attendanceKey);

            $joinUrl = null;
            if ($data['attendance_mode'] === 'online' && !empty($data['zoom_meeting_id'])) {
                $meetingIds = explode(',', $data['zoom_meeting_id']);
                $joinUrls = [];
                foreach ($meetingIds as $mId) {
                    $mId = trim($mId);
                    if (empty($mId)) continue;
                    $jUrl = $this->zoom->registerParticipant(
                        $mId,
                        $data['email'],
                        $data['first_name'],
                        $data['last_name']
                    );
                    if ($jUrl) {
                        $this->supabase->saveZoomDetails($userId, $jUrl);
                        $joinUrls[] = $jUrl;
                    }
                }
                if (!empty($joinUrls)) {
                    $joinUrl = implode(', ', $joinUrls);
                }
            }

            $tokenPayload = array_merge($data, [
                'user_id'        => $userId,
                'attendance_key' => $attendanceKey,
            ]);
            if ($joinUrl) {
                $tokenPayload['zoom_join_url'] = $joinUrl;
            }
            $token = $this->jwt->generate($tokenPayload);

            return $this->success($response, 'Registration successful', ['token' => $token]);

        } catch (\Throwable $e) {
            error_log('[' . date('Y-m-d H:i:s') . '] Registration error | Email: ' . ($data['email'] ?? 'N/A') . ' | ' . $e->getMessage());
            return $this->error($response, "There's a problem submitting your form. Please try again or contact the Administrator.");
        }
    }

    public function validateEmail(Request $request, Response $response): Response
    {
        $body  = (array) $request->getParsedBody();
        $email = trim($body['email_address'] ?? '');

        if ($this->model->emailExists($email)) {
            return $this->error($response, 'Email already registered');
        }

        return $this->success($response, 'Email is available');
    }

    public function refreshStatus(Request $request, Response $response): Response
    {
        $body   = (array) $request->getParsedBody();
        $userId = (int) ($body['user_id'] ?? 0);

        $data = $this->model->checkApproval($userId);

        if (!$data) {
            return $this->error($response, 'User not found', 404);
        }

        $responseData = ['approval_status' => $data['approval_status']];

        if ($data['approval_status'] == 1) {
            $keyData = $this->model->getAttendanceKey($userId);
            $responseData['attendance_key'] = $keyData['attendance_key'] ?? 'N/A';
        }

        return $this->success($response, 'Status fetched', $responseData);
    }

    public function getActiveMeetings(Request $request, Response $response): Response
    {
        try {
            $meetings = $this->zoom->listMeetings();
            
            if (empty($meetings)) {
                throw new \Exception("No live meetings returned");
            }

            // Map live Zoom API response to frontend format
            $mappedMeetings = array_map(function ($m) {
                return [
                    'meeting_id'   => (string)$m['id'],
                    'display_name' => $m['topic']
                ];
            }, $meetings);

            return $this->success($response, 'Active meetings fetched', ['meetings' => $mappedMeetings]);
        } catch (\Throwable $e) {
            // Fallback to local config file if API fails
            $meetingsFilePath = __DIR__ . '/../../config/zoom_meetings.json';
            $meetings = [];
            if (file_exists($meetingsFilePath)) {
                $meetings = json_decode(file_get_contents($meetingsFilePath), true) ?? [];
            }
            $activeMeetings = array_values(array_filter($meetings, function ($m) {
                return !empty($m['is_active']);
            }));
            return $this->success($response, 'Fallback active meetings fetched', ['meetings' => $activeMeetings]);
        }
    }

    private function success(Response $response, string $message, array $data = [], int $status = 200): Response
    {
        $payload = ['status' => 'success', 'success' => true, 'message' => $message];
        if ($data) {
            $payload['data'] = $data;
        }

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }

    private function error(Response $response, string $message, int $status = 400): Response
    {
        $payload = ['status' => 'error', 'success' => false, 'message' => $message];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
