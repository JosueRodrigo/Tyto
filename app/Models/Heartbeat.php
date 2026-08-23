<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Heartbeat extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'slug',
        'interval_minutes',
        'status',
        'last_seen_at',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function isFailing(): bool
    {
        if (! $this->last_seen_at) {
            return true;
        }

        return $this->nextExpectedAt()?->isPast() ?? true;
    }

    public function nextExpectedAt(): ?Carbon
    {
        return $this->last_seen_at?->copy()->addMinutes($this->interval_minutes + 1);
    }

    public function effectiveStatus(): string
    {
        if ($this->status === 'inactive') {
            return 'inactive';
        }

        return $this->isFailing() ? 'failing' : 'active';
    }
}
