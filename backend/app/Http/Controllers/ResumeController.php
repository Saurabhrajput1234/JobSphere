<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ResumeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:job_seeker')->only(['store', 'update', 'destroy']);
    }

    public function index()
    {
        $resumes = Resume::where('job_seeker_id', Auth::id())->get();
        return response()->json($resumes);
    }

    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'resume' => 'required|file|mimes:pdf|max:5120', // 5MB max
                'title' => 'required|string|max:255',
                'is_default' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $file = $request->file('resume');
            if (!$file) {
                Log::error('No file uploaded in resume upload request');
                return response()->json(['message' => 'No file uploaded'], 400);
            }

            // Store the file in the public disk under resumes directory
            $path = $file->store('resumes', 'public');
            if (!$path) {
                Log::error('Failed to store resume file', [
                    'original_name' => $file->getClientOriginalName(),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ]);
                return response()->json(['message' => 'Failed to store file'], 500);
            }

            // If this is set as default, unset any existing default
            if ($request->is_default) {
                Resume::where('job_seeker_id', Auth::id())
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $resume = Resume::create([
                'job_seeker_id' => Auth::id(),
                'file_path' => $path,
                'title' => $request->title,
                'is_default' => $request->is_default ?? false,
                'uploaded_at' => now(),
            ]);

            Log::info('Resume uploaded successfully', [
                'resume_id' => $resume->id,
                'user_id' => Auth::id(),
                'file_path' => $path
            ]);

            return response()->json($resume, 201);
        } catch (\Exception $e) {
            Log::error('Error uploading resume', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to upload resume'], 500);
        }
    }

    public function show(Resume $resume)
    {
        if (Auth::id() !== $resume->job_seeker_id && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($resume);
    }

    public function update(Request $request, Resume $resume)
    {
        if (Auth::id() !== $resume->job_seeker_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // If setting as default, unset any existing default
        if ($request->has('is_default') && $request->is_default) {
            Resume::where('job_seeker_id', Auth::id())
                ->where('is_default', true)
                ->where('id', '!=', $resume->id)
                ->update(['is_default' => false]);
        }

        $resume->update($request->only(['title', 'is_default']));
        return response()->json($resume);
    }

    public function destroy(Resume $resume)
    {
        if (Auth::id() !== $resume->job_seeker_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Delete the file from storage
            if (Storage::disk('public')->exists($resume->file_path)) {
                Storage::disk('public')->delete($resume->file_path);
            }
            
            $resume->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting resume', [
                'resume_id' => $resume->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Failed to delete resume'], 500);
        }
    }

    public function download(Resume $resume)
    {
        try {
            // Only allow download for the owner, recruiters who received the application, or admins
            $user = Auth::user();
            if ($user->id !== $resume->job_seeker_id && 
                !$user->isAdmin() && 
                !$resume->applications()
                    ->whereHas('job', function ($query) use ($user) {
                        $query->where('recruiter_id', $user->id);
                    })
                    ->exists()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if (!Storage::disk('public')->exists($resume->file_path)) {
                Log::error('Resume file not found', [
                    'resume_id' => $resume->id,
                    'file_path' => $resume->file_path
                ]);
                return response()->json(['message' => 'Resume file not found'], 404);
            }

            return Storage::disk('public')->download($resume->file_path);
        } catch (\Exception $e) {
            Log::error('Error downloading resume', [
                'resume_id' => $resume->id,
                'error' => $e->getMessage()
            ]);
            return response()->json(['message' => 'Failed to download resume'], 500);
        }
    }
} 