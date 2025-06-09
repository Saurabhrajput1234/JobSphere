<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class JobController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('role:recruiter,admin')->only(['store', 'update', 'destroy']);
    }

    public function index(Request $request)
    {
        $query = Job::query()->where('status', 'active');

        // Apply filters
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('company')) {
            $query->where('company_name', 'like', '%' . $request->company . '%');
        }

        $jobs = $query->with('recruiter')->latest()->paginate(10);
        return response()->json($jobs);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'required|string',
            'location' => 'required|string|max:255',
            'type' => 'required|string|in:full-time,part-time,contract,internship',
            'salary_range' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'application_deadline' => 'required|date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        $data['application_deadline'] = Carbon::parse($data['application_deadline']);
        
        $job = Job::create([
            ...$data,
            'recruiter_id' => Auth::id(),
            'company_name' => Auth::user()->company_name,
        ]);

        return response()->json($job, 201);
    }

    public function show(Job $job)
    {
        return response()->json($job->load('recruiter'));
    }

    public function update(Request $request, Job $job)
    {
        if (Auth::id() !== $job->recruiter_id && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'description' => 'string',
            'requirements' => 'string',
            'location' => 'string|max:255',
            'type' => 'string|in:full-time,part-time,contract,internship',
            'salary_range' => 'string|max:255',
            'category' => 'string|max:255',
            'status' => 'string|in:active,closed,draft',
            'application_deadline' => 'date|after:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->all();
        if (isset($data['application_deadline'])) {
            $data['application_deadline'] = Carbon::parse($data['application_deadline']);
        }

        $job->update($data);
        return response()->json($job);
    }

    public function destroy(Job $job)
    {
        if (Auth::id() !== $job->recruiter_id && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->delete();
        return response()->json(null, 204);
    }
} 