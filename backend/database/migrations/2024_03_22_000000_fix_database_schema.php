<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add role column to users table if it doesn't exist
        if (!Schema::hasColumn('users', 'role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('role')->default('job_seeker');
                $table->string('company_name')->nullable();
                $table->text('company_description')->nullable();
            });
        }

        // Create resumes table if it doesn't exist
        if (!Schema::hasTable('resumes')) {
            Schema::create('resumes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_seeker_id')->constrained('users')->onDelete('cascade');
                $table->string('title');
                $table->string('file_path');
                $table->boolean('is_default')->default(false);
                $table->timestamp('uploaded_at');
                $table->timestamps();
            });
        }

        // Create applications table if it doesn't exist
        if (!Schema::hasTable('applications')) {
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

        // Create jobs table if it doesn't exist
        if (!Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description');
                $table->text('requirements');
                $table->string('location');
                $table->string('type');
                $table->string('salary_range');
                $table->string('category');
                $table->string('status')->default('active');
                $table->foreignId('recruiter_id')->constrained('users')->onDelete('cascade');
                $table->string('company_name');
                $table->timestamp('application_deadline');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
        Schema::dropIfExists('resumes');
        Schema::dropIfExists('jobs');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'company_name', 'company_description']);
        });
    }
}; 