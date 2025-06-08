<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class PublicController extends Controller
{
    public function getAllUsers()
    {
        try {
            $users = User::select('id', 'name', 'email', 'last_login_at', 'last_login_ip', 'created_at')
                        ->orderBy('created_at', 'desc')
                        ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Users retrieved successfully',
                'data' => [
                    'users' => $users
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 