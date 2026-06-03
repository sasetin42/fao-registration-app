<?php

namespace App\Models;

use App\Services\SupabaseService;

class RegistrationModel
{
    public function __construct(private SupabaseService $db) {}

    public function addParticipant(array $d): array
    {
        $d['created_at'] = date('Y-m-d H:i:s');
        
        $result = $this->db->insert('registration_list', $d);

        return [
            'affected_rows' => empty($result) ? 0 : 1,
            'user_id'       => empty($result) ? 0 : $result[0]['id'],
        ];
    }

    public function addAttendanceKey(int $participantId, string $visitorCode, string $attendanceKey): bool
    {
        // Upsert logic for attendance keys - assuming Supabase table has a unique constraint on participant_id
        // To do an upsert via REST, we would need to pass ?on_conflict, but for now simple insert is fine.
        $result = $this->db->insert('attendance_keys', [
            'participant_id' => $participantId,
            'visitor_code' => $visitorCode,
            'attendance_key' => $attendanceKey
        ]);

        return !empty($result);
    }

    public function emailExists(string $email): bool
    {
        $result = $this->db->select('registration_list', ['email' => $email], 'id');
        return count($result) > 0;
    }

    public function checkApproval(int $userId): ?array
    {
        $result = $this->db->select('registration_list', ['id' => $userId], 'approval_status');
        return empty($result) ? null : $result[0];
    }

    public function getAttendanceKey(int $participantId): ?array
    {
        $result = $this->db->select('attendance_keys', ['participant_id' => $participantId], 'visitor_code, attendance_key');
        return empty($result) ? null : $result[0];
    }

    public function getAllRegistrations(): array
    {
        // Select all from registration list
        // Note: With Supabase select we can add ordering via query params, but basic select will do.
        $registrations = $this->db->select('registration_list');
        
        // We might want to join attendance keys, but since REST doesn't natively do a join without setup,
        // we can fetch them separately or if it's fine without it.
        return $registrations;
    }

    public function updateApprovalStatus(int $userId, int $status): bool
    {
        $result = $this->db->update('registration_list', ['approval_status' => $status], ['id' => $userId]);
        return !empty($result);
    }

    public function updateApprovalStatusBatch(array $userIds, int $status): bool
    {
        if (empty($userIds)) return false;
        $result = $this->db->updateBatch('registration_list', ['approval_status' => $status], 'id', $userIds);
        return !empty($result);
    }

    public function deleteRegistration(int $userId): bool
    {
        // Supabase foreign keys (ON DELETE CASCADE) should handle the attendance_keys and zoom_registrations
        return $this->db->delete('registration_list', ['id' => $userId]);
    }

    public function deleteRegistrationBatch(array $userIds): bool
    {
        if (empty($userIds)) return false;
        return $this->db->deleteBatch('registration_list', 'id', $userIds);
    }
}
