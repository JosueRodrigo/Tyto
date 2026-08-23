<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>@yield('title')</title>

        <!-- Styles -->
        <style>
            html, body {
                background: radial-gradient(circle at 30% 10%, rgba(159,85,255,.22), transparent 32rem), #050510;
                color: #eaeaea;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                font-weight: 500;
                height: 100vh;
                margin: 0;
            }

            .full-height {
                height: 100vh;
            }

            .flex-center {
                align-items: center;
                display: flex;
                justify-content: center;
            }

            .position-ref {
                position: relative;
            }

            .content {
                text-align: center;
                padding: 48px;
                border: 1px solid rgba(255,255,255,.1);
                border-radius: 28px;
                background: rgba(16,16,32,.85);
                box-shadow: 0 30px 100px rgba(0,0,0,.45);
            }

            .title {
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -.04em;
                padding: 20px;
            }

            .title::before {
                content: 'TYTO';
                display: block;
                color: #9f55ff;
                font-size: 12px;
                letter-spacing: .24em;
                margin-bottom: 18px;
            }
        </style>
    </head>
    <body>
        <div class="flex-center position-ref full-height">
            <div class="content">
                <div class="title">
                    @yield('message')
                </div>
            </div>
        </div>
    </body>
</html>
