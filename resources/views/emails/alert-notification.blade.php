<x-mail::message>
# Tyto Alert

{{ $messageContent }}

<x-mail::button :url="config('app.url')">
Go to Dashboard
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
