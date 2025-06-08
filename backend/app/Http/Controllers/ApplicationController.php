<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:job_seeker')->only(['store']);
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Application::query();

        if ($user->isJobSeeker()) {
            $query->where('job_seeker_id', $user->id);
        } elseif ($user->isRecruiter()) {
            $query->whereHas('job', function ($q) use ($user) {
                $q->where('recruiter_id', $user->id);
            });
        }

        $applications = $query->with(['job', 'jobSeeker', 'resume'])->latest()->paginate(10);
        return response()->json($applications);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:jobs,id',
            'resume_id' => 'required|exists:resumes,id',
            'cover_letter' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $job = Job::findOrFail($request->job_id);
        
        // Check if job is still active
        if ($job->status !== 'active') {
            return response()->json(['message' => 'This job is no longer accepting applications'], 400);
        }

        // Check if deadline has passed
        if ($job->application_deadline < now()) {
            return response()->json(['message' => 'Application deadline has passed'], 400);
        }

        // Check if user has already applied
        if (Application::where('job_id', $request->job_id)
            ->where('job_seeker_id', Auth::id())
            ->exists()) {
            return response()->json(['message' => 'You have already applied for this job'], 400);
        }

        $application = Application::create([
            'job_id' => $request->job_id,
            'job_seeker_id' => Auth::id(),
            'resume_id' => $request->resume_id,
            'cover_letter' => $request->cover_letter,
            'status' => 'pending',
        ]);

        return response()->json($application, 201);
    }

    public function show(Application $application)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && 
            $user->id !== $application->job_seeker_id && 
            $user->id !== $application->job->recruiter_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($application->load(['job', 'jobSeeker', 'resume']));
    }

    public function update(Request $request, Application $application)
    {
        $user = Auth::user();
        
        if (!$user->isAdmin() && $user->id !== $application->job->recruiter_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,reviewed,accepted,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application->update($request->only('status'));
        return response()->json($application);
    }
} 