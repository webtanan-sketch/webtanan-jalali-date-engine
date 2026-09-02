<?php

declare(strict_types=1);

namespace Webtanan\JalaliDateEngine\Laravel;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Webtanan\JalaliDateEngine\JalaliValidator;

final class JalaliDateRule implements ValidationRule
{
    public function __construct(private readonly string $message = 'فیلد :attribute باید یک تاریخ شمسی معتبر باشد.')
    {
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value) || !JalaliValidator::isValidString($value)) {
            $fail(str_replace(':attribute', $attribute, $this->message));
        }
    }
}
