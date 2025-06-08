<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
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

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
}; 