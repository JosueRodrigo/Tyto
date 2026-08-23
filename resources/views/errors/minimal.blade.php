<!DOCTYPE html>
<html lang="en">
    <head>
<html lang="en" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title') | Tyto</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
    </style>
</head>
<body class="h-full bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-6 text-center text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
    <div class="relative mb-8">
        <div class="absolute -inset-4 bg-green-500/10 blur-2xl rounded-full"></div>
        <img src="/logo.png" alt="Tyto" class="relative w-24 h-24 object-contain">
    </div>
    
    <div class="space-y-4">
        <h1 class="text-7xl font-extrabold tracking-tight">@yield('code')</h1>
        <p class="text-xl text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
            @yield('message')
        </p>
    </div>
    
    <div class="mt-10">
        <a href="/" class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-2xl text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 transition-all shadow-xl hover:scale-105 active:scale-95">
            Back to Dashboard
        </a>
    </div>
    
    <div class="absolute bottom-8 text-sm font-medium text-neutral-400">
        &copy; {{ date('Y') }} Tyto Monitoring.
    </div>
</body>
</html>
