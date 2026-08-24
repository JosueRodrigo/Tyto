<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('integrations', function (Blueprint $table) {
            $table->longText('data')->nullable()->change();
        });

        DB::table('integrations')->orderBy('id')->chunkById(100, function ($integrations): void {
            foreach ($integrations as $integration) {
                if ($integration->data === null) {
                    continue;
                }

                DB::table('integrations')->where('id', $integration->id)->update([
                    'data' => Crypt::encryptString($integration->data),
                ]);
            }
        });
    }

    public function down(): void
    {
        DB::table('integrations')->orderBy('id')->chunkById(100, function ($integrations): void {
            foreach ($integrations as $integration) {
                if ($integration->data === null) {
                    continue;
                }

                DB::table('integrations')->where('id', $integration->id)->update([
                    'data' => Crypt::decryptString($integration->data),
                ]);
            }
        });

        Schema::table('integrations', function (Blueprint $table) {
            $table->json('data')->nullable()->change();
        });
    }
};
