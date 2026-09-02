@props([
    'name',
    'value' => null,
    'id' => null,
    'label' => null,
    'required' => false,
    'disabled' => false,
    'time' => null,
])

@php
    $fieldId = $id ?: 'webtanan-jalali-' . md5($name);
    $timeEnabled = $time ?? config('webtanan-jalali.time', false);
@endphp

<div
    class="webtanan-jalali-field"
    dir="rtl"
    data-webtanan-jalali
    data-time="{{ $timeEnabled ? 'true' : 'false' }}"
    data-minute-step="{{ (int) config('webtanan-jalali.minute_step', 15) }}"
>
    @if($label)
        <label for="{{ $fieldId }}" class="webtanan-jalali-field__label">
            {{ $label }}
        </label>
    @endif

    <input
        id="{{ $fieldId }}"
        name="{{ $name }}"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        value="{{ old($name, $value) }}"
        placeholder="1405/06/11{{ $timeEnabled ? ' 14:30' : '' }}"
        @required($required)
        @disabled($disabled)
        {{ $attributes->merge(['class' => 'webtanan-jalali-field__input']) }}
    />

    <small class="webtanan-jalali-field__hint">
        تاریخ را به‌صورت شمسی وارد کنید.
    </small>
</div>
