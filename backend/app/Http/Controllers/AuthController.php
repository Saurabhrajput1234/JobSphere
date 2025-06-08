<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct()
    {
        // No middleware in constructor for Laravel 12
    }

    public function register(Request $request)
    {
        try {
            \Log::info('Starting registration process');
            \Log::info('Request data:', $request->all());

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                \Log::warning('Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('Creating new user with email: ' . $request->email);

            // Hash password explicitly
            $hashedPassword = password_hash($request->password, PASSWORD_BCRYPT);
            \Log::info('Password hashed successfully');

            // Create user with hashed password
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $hashedPassword,
            ]);

            \Log::info('User created successfully with ID: ' . $user->id);

            try {
                // Generate token using JWTAuth directly
                $token = JWTAuth::fromUser($user);
                
                if (!$token) {
                    throw new \Exception('Failed to generate token');
                }

                \Log::info('Token generated successfully for user: ' . $user->id);

                // Prepare user data without sensitive information
                $userData = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ];

                $response = [
                    'status' => 'success',
                    'message' => 'User created successfully',
                    'data' => [
                        'user' => $userData,
                        'token' => $token,
                        'token_type' => 'bearer'
                    ]
                ];

                \Log::info('Sending response:', $response);
                return response()->json($response, 201);

            } catch (\Exception $e) {
                \Log::error('Token generation error: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                
                // Even if token generation fails, return success with user data
                return response()->json([
                    'status' => 'success',
                    'message' => 'User created successfully but token generation failed',
                    'data' => [
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'created_at' => $user->created_at,
                        ]
                    ]
                ], 201);
            }

        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            if ($e instanceof \Illuminate\Database\QueryException) {
                \Log::error('Database error details: ' . $e->getMessage());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Database error occurred',
                    'error' => 'A database error occurred while creating the user'
                ], 500);
            }

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
            \Log::info('Login attempt for email: ' . $request->email);
            \Log::info('Request data:', $request->all());

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if ($validator->fails()) {
                \Log::warning('Login validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            try {
                // Get user by email
                $user = User::where('email', $request->email)->first();
                
                if (!$user) {
                    \Log::warning('User not found with email: ' . $request->email);
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid credentials'
                    ], 401);
                }

                \Log::info('User found with ID: ' . $user->id);

                // Verify password manually
                if (!password_verify($request->password, $user->password)) {
                    \Log::warning('Invalid password for user: ' . $user->id);
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invalid credentials'
                    ], 401);
                }

                \Log::info('Password verified successfully for user: ' . $user->id);

                try {
                    // Generate token using auth()->login
                    auth()->login($user);
                    $token = auth()->tokenById($user->id);
                    
                    if (!$token) {
                        throw new \Exception('Failed to generate token');
                    }

                    \Log::info('Token generated successfully for user: ' . $user->id);

                    // Update last login information
                    $user->update([
                        'last_login_at' => now(),
                        'last_login_ip' => $request->ip()
                    ]);

                    \Log::info('Last login information updated for user: ' . $user->id);

                    $response = [
                        'status' => 'success',
                        'message' => 'Login successful',
                        'data' => [
                            'user' => [
                                'id' => $user->id,
                                'name' => $user->name,
                                'email' => $user->email,
                                'last_login_at' => $user->last_login_at,
                                'last_login_ip' => $user->last_login_ip
                            ],
                            'token' => $token,
                            'token_type' => 'bearer'
                        ]
                    ];

                    \Log::info('Sending successful login response');
                    return response()->json($response);

                } catch (\Exception $e) {
                    \Log::error('Token generation error: ' . $e->getMessage());
                    \Log::error('Stack trace: ' . $e->getTraceAsString());
                    
                    // Try alternative token generation
                    try {
                        $token = JWTAuth::fromUser($user);
                        if ($token) {
                            \Log::info('Token generated successfully using alternative method');
                            
                            $response = [
                                'status' => 'success',
                                'message' => 'Login successful',
                                'data' => [
                                    'user' => [
                                        'id' => $user->id,
                                        'name' => $user->name,
                                        'email' => $user->email,
                                        'last_login_at' => $user->last_login_at,
                                        'last_login_ip' => $user->last_login_ip
                                    ],
                                    'token' => $token,
                                    'token_type' => 'bearer'
                                ]
                            ];
                            
                            return response()->json($response);
                        }
                    } catch (\Exception $e2) {
                        \Log::error('Alternative token generation failed: ' . $e2->getMessage());
                    }
                    
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Token generation failed',
                        'error' => $e->getMessage()
                    ], 500);
                }

            } catch (\Exception $e) {
                \Log::error('User verification error: ' . $e->getMessage());
                \Log::error('Stack trace: ' . $e->getTraceAsString());
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'User verification failed',
                    'error' => $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Login error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout()
    {
        try {
            Auth::logout();
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
            return response()->json([
                'status' => 'success',
                'message' => 'Token refreshed successfully',
                'data' => [
                    'user' => Auth::user(),
                    'authorization' => [
                        'token' => Auth::refresh(),
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
            \Log::info('getAllUsers method called');
            
            $users = User::select('id', 'name', 'email', 'last_login_at', 'last_login_ip', 'created_at')
                        ->orderBy('created_at', 'desc')
                        ->get();

            \Log::info('Users retrieved: ' . $users->count());

            return response()->json([
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'data' => [
                    'users' => $users
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getAllUsers: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
