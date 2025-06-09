<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            Log::info('Starting registration process');
            Log::info('Request data:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'role' => 'required|string|in:job_seeker,recruiter',
                'company_name' => 'required_if:role,recruiter|nullable|string|max:255',
                'company_description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                Log::warning('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            Log::info('Creating new user: ' . $request->email);

            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ];

            // Only add company fields if role is recruiter
            if ($request->role === 'recruiter') {
                $userData['company_name'] = $request->company_name;
                $userData['company_description'] = $request->company_description;
            }

            $user = User::create($userData);

            Log::info('User created: ID ' . $user->id);

            // Set JWT TTL and generate token
            $ttl = (int) env('JWT_TTL', config('jwt.ttl', 60));
            JWTAuth::factory()->setTTL($ttl);
            $token = JWTAuth::fromUser($user);

            if (!$token) {
                throw new \Exception('Failed to generate token');
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Registration successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'company_name' => $user->company_name,
                        'company_description' => $user->company_description,
                    ],
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => $ttl * 60,
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            Log::info('Login attempt for: ' . $request->email);

            $credentials = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $user = User::where('email', $request->email)->first();
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Invalid login for: ' . $request->email);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Set JWT TTL and generate token
            $ttl = (int) env('JWT_TTL', config('jwt.ttl', 60));
            JWTAuth::factory()->setTTL($ttl);
            $token = JWTAuth::fromUser($user);

            // Update login info
            $user->last_login_at = now();
            $user->last_login_ip = $request->ip();
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Login successful',
                'user' => $user,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => $ttl * 60
            ]);

        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            JWTAuth::invalidate(JWTAuth::getToken());
            return response()->json([
                'status' => 'success',
                'message' => 'Successfully logged out',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function refresh()
    {
        try {
            $newToken = Auth::refresh();
            return response()->json([
                'status' => 'success',
                'message' => 'Token refreshed successfully',
                'data' => [
                    'user' => Auth::user(),
                    'authorization' => [
                        'token' => $newToken,
                        'type' => 'bearer',
                        'expires_in' => auth()->factory()->getTTL() * 60
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token refresh failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function me()
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => Auth::user()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch user data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAllUsers()
    {
        try {
            Log::info('getAllUsers called');
            $users = User::select('id', 'name', 'email', 'last_login_at', 'last_login_ip', 'created_at')
                        ->orderBy('created_at', 'desc')
                        ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'data' => ['users' => $users]
            ]);
        } catch (\Exception $e) {
            Log::error('getAllUsers error: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
