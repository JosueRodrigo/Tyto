<?php

namespace App\Models;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class Integration extends Model
{
    protected $fillable = [
        'project_id',
        'name',
        'type',
        'data',
        'is_enabled',
        'status',
        'last_error',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    protected function data(): Attribute
    {
        return Attribute::make(
            get: fn (?string $value): array => $this->decodeConfiguration($value),
            set: fn (?array $value): ?string => $value === null
                ? null
                : Crypt::encryptString(json_encode($value, JSON_THROW_ON_ERROR)),
        );
    }

    public function hasUnreadableConfiguration(): bool
    {
        $value = $this->getRawOriginal('data');

        if ($value === null || $this->isJsonObject($value)) {
            return false;
        }

        try {
            $decrypted = Crypt::decryptString($value);

            return ! $this->isJsonObject($decrypted);
        } catch (DecryptException) {
            return true;
        }
    }

    public function configurationForDisplay(): array
    {
        $configuration = $this->data ?? [];

        foreach ($this->secretFields() as $field) {
            if (filled($configuration[$field] ?? null)) {
                $configuration[$field] = '';
            }
        }

        return $configuration;
    }

    private function decodeConfiguration(?string $value): array
    {
        if ($value === null) {
            return [];
        }

        // Compatibility for integrations created before configuration was
        // encrypted. A repair migration rewrites these values at rest.
        if ($this->isJsonObject($value)) {
            return json_decode($value, true, flags: JSON_THROW_ON_ERROR);
        }

        try {
            $decrypted = Crypt::decryptString($value);

            return $this->isJsonObject($decrypted)
                ? json_decode($decrypted, true, flags: JSON_THROW_ON_ERROR)
                : [];
        } catch (DecryptException) {
            // A changed APP_KEY cannot be recovered. Keep the settings page
            // available so the owner can replace the affected credentials.
            return [];
        }
    }

    private function isJsonObject(string $value): bool
    {
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE && is_array($decoded);
    }

    public function mergeConfiguration(array $configuration): array
    {
        $current = $this->data ?? [];

        foreach ($this->secretFields() as $field) {
            if (blank($configuration[$field] ?? null) && filled($current[$field] ?? null)) {
                $configuration[$field] = $current[$field];
            }
        }

        return $configuration;
    }

    public function secretFields(): array
    {
        return match ($this->type) {
            'slack', 'discord' => ['webhook_url'],
            'telegram' => ['bot_token'],
            'webhook' => ['url'],
            'email' => ['smtp_password'],
            default => [],
        };
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function alertRules()
    {
        return $this->belongsToMany(AlertRule::class, 'alert_rule_integration');
    }

    public function alertDeliveries(): HasMany
    {
        return $this->hasMany(AlertDelivery::class);
    }
}
