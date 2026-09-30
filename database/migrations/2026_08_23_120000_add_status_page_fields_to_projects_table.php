<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->boolean('status_page_enabled')->default(false)->after('uptime_monitoring_enabled');
            $table->string('status_page_slug')->nullable()->unique()->after('status_page_enabled');
            $table->string('status_page_title')->nullable()->after('status_page_slug');
            $table->boolean('status_page_show_heartbeats')->default(false)->after('status_page_title');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['status_page_slug']);
            $table->dropColumn([
                'status_page_enabled',
                'status_page_slug',
                'status_page_title',
                'status_page_show_heartbeats',
            ]);
        });
    }
};
