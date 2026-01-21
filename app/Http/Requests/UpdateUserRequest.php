<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'email' => 'nullable|email|unique:users,email,' . $this->user->id,
            'phone' => 'nullable|string|max:20',
            'package_id' => 'nullable|exists:packages,id',
            'expires_at' => 'nullable|date',
            'mac_address' => 'nullable|mac_address',
            'ip_address' => 'nullable|ip',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
