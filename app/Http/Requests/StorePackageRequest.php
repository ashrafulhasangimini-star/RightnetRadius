<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|unique:packages|max:100',
            'description' => 'nullable|string|max:500',
            'speed_download' => 'required|integer|min:1|max:10000',
            'speed_upload' => 'required|integer|min:1|max:10000',
            'fup_limit' => 'nullable|numeric|min:0',
            'fup_reset_day' => 'nullable|integer|min:1|max:31',
            'validity_days' => 'required|integer|min:1|max:365',
            'price' => 'required|numeric|min:0|max:999999',
            'sort_order' => 'nullable|integer',
        ];
    }
}
