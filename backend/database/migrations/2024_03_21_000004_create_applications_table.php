<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_seeker_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('resume_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->text('cover_letter')->nullable();
            $table->timestamps();

            // Prevent duplicate applications
            $table->unique(['job_id', 'job_seeker_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
}; 