<?php

namespace App\Services;

class ZoomService
{
    private string $accountId;
    private string $clientId;
    private string $clientSecret;
    private string $settingsFilePath;

    public function __construct()
    {
        $this->settingsFilePath = __DIR__ . '/../../config/zoom_settings.json';
        $this->loadCredentials();
    }

    private function loadCredentials(): void
    {
        if (file_exists($this->settingsFilePath)) {
            $settings = json_decode(file_get_contents($this->settingsFilePath), true);
            $this->accountId = $settings['account_id'] ?? $_ENV['ZOOM_ACCOUNT_ID'] ?? '';
            $this->clientId = $settings['client_id'] ?? $_ENV['ZOOM_CLIENT_ID'] ?? '';
            $this->clientSecret = $settings['client_secret'] ?? $_ENV['ZOOM_CLIENT_SECRET'] ?? '';
        } else {
            $this->accountId = $_ENV['ZOOM_ACCOUNT_ID'] ?? '';
            $this->clientId = $_ENV['ZOOM_CLIENT_ID'] ?? '';
            $this->clientSecret = $_ENV['ZOOM_CLIENT_SECRET'] ?? '';
        }
    }

    private function getAccessToken(): string
    {
        $this->loadCredentials(); // Refresh in case they were updated
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://zoom.us/oauth/token?grant_type=account_credentials&account_id={$this->accountId}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        $credentials = base64_encode("{$this->clientId}:{$this->clientSecret}");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Basic {$credentials}",
            "Content-Type: application/x-www-form-urlencoded"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);
        $data = json_decode($response, true);
        return $data['access_token'] ?? '';
    }

    public function registerParticipant(string $meetingId, string $email, string $firstName, string $lastName): ?string
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/meetings/{$meetingId}/registrants");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
        ]));
        $response = curl_exec($ch);
        curl_close($ch);
        
        $data = json_decode($response, true);
        return $data['join_url'] ?? null;
    }

    public function listMeetings(): array
    {
        $token = $this->getAccessToken();
        if (!$token) return [];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/users/me/meetings?type=scheduled&page_size=300");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return $data['meetings'] ?? [];
    }

    public function getMeetingDetails(string $meetingId): ?array
    {
        $token = $this->getAccessToken();
        if (!$token) {
            return ['error' => 'Could not retrieve Zoom access token. Please verify credentials.'];
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/meetings/{$meetingId}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $data = json_decode($response, true);
        if ($httpCode >= 400 || (isset($data['code']) && $data['code'] != 200)) {
            return ['error' => $data['message'] ?? 'Zoom API error (' . $httpCode . ')'];
        }
        return $data;
    }

    public function getMeetingRegistrants(string $meetingId): array
    {
        $token = $this->getAccessToken();
        if (!$token) return [];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/meetings/{$meetingId}/registrants?page_size=300");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return $data['registrants'] ?? [];
    }

    public function getMeetingParticipants(string $meetingId): array
    {
        $token = $this->getAccessToken();
        if (!$token) return [];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/report/meetings/{$meetingId}/participants?page_size=300");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        if (isset($data['participants'])) {
            return $data['participants'];
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.zoom.us/v2/past_meetings/{$meetingId}/participants?page_size=300");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$token}",
            "Content-Type: application/json"
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $data = json_decode($response, true);
        return $data['participants'] ?? [];
    }
}
