<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'data' => 'encrypted:array',
        'is_enabled' => 'boolean',
    ];

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
            'webhook' => ['url', 'signing_secret'],
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
