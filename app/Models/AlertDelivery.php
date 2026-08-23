<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlertDelivery extends Model
{
    protected $fillable = [
        'project_id',
        'alert_rule_id',
        'integration_id',
        'event_type',
        'title',
        'message',
        'fields',
        'url',
        'status',
        'attempts',
        'last_error',
        'delivered_at',
    ];

    protected $casts = [
        'fields' => 'array',
        'delivered_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function alertRule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }
}
