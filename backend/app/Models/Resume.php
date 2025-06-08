<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Resume extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_seeker_id',
        'file_path',
        'title',
        'is_default',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'is_default' => 'boolean',
    ];

    public function jobSeeker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'job_seeker_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
} 