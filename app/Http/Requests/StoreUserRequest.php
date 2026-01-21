<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|unique:users|min:3|max:32|regex:/^[a-zA-Z0-9._-]+$/',
            'email' => 'nullable|email|unique:users',
            'phone' => 'nullable|string|max:20',
            'package_id' => 'required|exists:packages,id',
            'expires_at' => 'required|date|after:now',
            'mac_address' => 'nullable|mac_address',
            'ip_address' => 'nullable|ip',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'username.regex' => 'Username can only contain letters, numbers, dots, hyphens, and underscores',
            'expires_at.after' => 'Expiry date must be in the future',
        ];
    }
}
