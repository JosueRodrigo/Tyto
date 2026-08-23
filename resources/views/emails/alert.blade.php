<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }

        .header {
            background: #0f172a;
            padding: 32px;
            color: #ffffff;
            text-align: center;
        }

        .content {
            padding: 32px;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 16px;
        }

        .badge-error {
            background: #fef2f2;
            color: #ef4444;
        }

        .title {
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 8px;
            color: #0f172a;
        }

        .message {
            font-size: 16px;
            color: #475569;
            margin-bottom: 24px;
            white-space: pre-wrap;
        }

        .metadata {
            background: #f1f5f9;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 24px;
        }

        .meta-item {
            font-size: 13px;
            margin-bottom: 8px;
            display: flex;
        }

        .meta-label {
            font-weight: 700;
            width: 100px;
            color: #64748b;
        }

        .stack-trace {
            background: #0f172a;
            color: #94a3b8;
            padding: 20px;
            border-radius: 12px;
            font-family: 'Fira Code', monospace;
            font-size: 12px;
            overflow-x: auto;
            margin-top: 24px;
        }

        .footer {
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin-top: 16px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <strong style="font-size: 22px; color: #9f55ff; letter-spacing: -0.03em;">TYTO</strong>
        </div>
        <div class="content">
            <div class="badge badge-error">Alert Notification</div>
            <div class="title">Critical System Alert</div>
            <div class="message">{!! nl2br(e($messageContent)) !!}</div>

            @if (!empty($metadata))
                <div class="metadata">
                    @foreach ($metadata as $label => $value)
                        <div class="meta-item">
                            <span class="meta-label">{{ ucfirst(str_replace('_', ' ', $label)) }}:</span>
                            <span style="color: #1e293b; font-weight: 500;">{{ $value }}</span>
                        </div>
                    @endforeach
                </div>
            @endif

            @if (!empty($stackTrace))
                <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 8px;">Stack Trace Snippet
                </div>
                <div class="stack-trace">
                    <code>{!! nl2br(e($stackTrace)) !!}</code>
                </div>
            @endif

            <div style="text-align: center;">
                <a href="{{ $actionUrl ?? config('app.url') }}" class="button">View in Dashboard</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Tyto. All rights reserved. <br>
            Sent via Tyto Monitoring.
        </div>
    </div>
</body>

</html>
