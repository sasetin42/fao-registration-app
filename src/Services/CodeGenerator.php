<?php

namespace App\Services;

class CodeGenerator
{
    private const ATTENDANCE_SECRET = 'PCCP_ONLINE_SECRET';
    private const VISITOR_SECRET    = 'PCCP_VISITOR_SECRET';

    public function generateVisitorCode(int $id, string $prefix): string
    {
        $hash = hash_hmac('sha256', (string) $id, self::VISITOR_SECRET);
        $code = strtoupper(substr(base_convert(substr($hash, 0, 12), 16, 36), 0, 6));

        return "{$prefix}-{$code}";
    }

    public function generateAttendanceKey(int $userId): string
    {
        return strtoupper(substr(
            hash_hmac('sha256', (string) $userId, self::ATTENDANCE_SECRET),
            0,
            15
        ));
    }

    public function generateRandomString(int $length = 10): string
    {
        $chars  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $result = '';

        for ($i = 0; $i < $length; $i++) {
            $result .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $pos    = random_int(0, min(5, strlen($result) - 1));
        $result = substr_replace($result, (string) random_int(0, 9), $pos, 0);

        return strtoupper($result);
    }

}
