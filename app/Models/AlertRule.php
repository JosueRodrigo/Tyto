<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AlertRule extends Model
{
    protected $fillable = ['project_id', 'name', 'event_type', 'settings', 'is_enabled'];

    protected $casts = [
        'settings' => 'array',
        'is_enabled' => 'boolean',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function integrations()
    {
        return $this->belongsToMany(Integration::class, 'alert_rule_integration');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(AlertDelivery::class);
    }
}
