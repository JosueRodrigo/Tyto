<?php

use Illuminate\Contracts\Encryption\DecryptException;
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

                try {
                    Crypt::decryptString($integration->data);

                    continue;
                } catch (DecryptException) {
                    // Continue only for legacy JSON values below.
                }

                json_decode($integration->data, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
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

                try {
                    $decrypted = Crypt::decryptString($integration->data);
                } catch (DecryptException) {
                    continue;
                }

                DB::table('integrations')->where('id', $integration->id)->update(['data' => $decrypted]);
            }
        });

        Schema::table('integrations', function (Blueprint $table) {
            $table->json('data')->nullable()->change();
        });
    }
};
