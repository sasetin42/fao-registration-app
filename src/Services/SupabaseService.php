<?php

namespace App\Services;

class SupabaseService
{
    private string $url;
    private string $key;

    public function __construct()
    {
        $this->url = $_ENV['SUPABASE_URL'] ?? 'https://fwgoejdzuszfrpqzomtl.supabase.co';
        $this->key = $_ENV['SUPABASE_KEY'] ?? '';
    }

    public function saveZoomDetails(int $userId, string $joinUrl): void
    {
        if (!$this->key) {
            error_log("Supabase key is not configured. Could not save zoom_join_url.");
            return;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/zoom_registrations");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json",
            "Prefer: return=minimal"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
            'user_id' => $userId,
            'join_url' => $joinUrl
        ]));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log("Supabase error saving zoom details: " . $response);
        }
    }

    public function insert(string $table, array $data): array
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json",
            "Prefer: return=representation"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log("Supabase insert error: " . $response);
            return [];
        }

        return json_decode($response, true) ?? [];
    }

    public function select(string $table, array $match = [], string $select = '*'): array
    {
        $query = "?select={$select}";
        foreach ($match as $key => $value) {
            $query .= "&{$key}=eq." . urlencode($value);
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json"
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log("Supabase select error: " . $response);
            return [];
        }

        return json_decode($response, true) ?? [];
    }

    public function update(string $table, array $data, array $match): array
    {
        $query = "?";
        foreach ($match as $key => $value) {
            $query .= "{$key}=eq." . urlencode($value) . "&";
        }
        $query = rtrim($query, '&');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json",
            "Prefer: return=representation"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log("Supabase update error: " . $response);
            return [];
        }

        return json_decode($response, true) ?? [];
    }

    public function delete(string $table, array $match): bool
    {
        $query = "?";
        foreach ($match as $key => $value) {
            $query .= "{$key}=eq." . urlencode($value) . "&";
        }
        $query = rtrim($query, '&');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}"
        ]);
        
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode >= 200 && $httpCode < 300;
    }

    public function updateBatch(string $table, array $data, string $key, array $values): array
    {
        $valueStr = implode(',', array_map('intval', $values));
        $query = "?{$key}=in.({$valueStr})";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}",
            "Content-Type: application/json",
            "Prefer: return=representation"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log("Supabase updateBatch error: " . $response);
            return [];
        }

        return json_decode($response, true) ?? [];
    }

    public function deleteBatch(string $table, string $key, array $values): bool
    {
        $valueStr = implode(',', array_map('intval', $values));
        $query = "?{$key}=in.({$valueStr})";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "{$this->url}/rest/v1/{$table}{$query}");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "apikey: {$this->key}",
            "Authorization: Bearer {$this->key}"
        ]);
        
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return $httpCode >= 200 && $httpCode < 300;
    }
}
