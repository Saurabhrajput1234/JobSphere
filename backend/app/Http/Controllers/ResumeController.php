<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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
        $validator = Validator::make($request->all(), [
            'resume' => 'required|file|mimes:pdf|max:5120', // 5MB max
            'title' => 'required|string|max:255',
            'is_default' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('resume');
        $path = $file->store('resumes', 'public');

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

        return response()->json($resume, 201);
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

        // Delete the file from storage
        Storage::disk('public')->delete($resume->file_path);
        
        $resume->delete();
        return response()->json(null, 204);
    }

    public function download(Resume $resume)
    {
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

        return Storage::disk('public')->download($resume->file_path);
    }
} 