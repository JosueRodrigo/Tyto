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
        'data' => 'array',
        'is_enabled' => 'boolean',
    ];

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
