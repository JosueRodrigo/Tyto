<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('integrations')->orderBy('id')->chunkById(100, function ($integrations): void {
            foreach ($integrations as $integration) {
                if ($integration->data === null) {
                    continue;
                }

                try {
                    Crypt::decryptString($integration->data);

                    continue;
                } catch (DecryptException) {
                    // Only rewrite valid legacy JSON. Invalid ciphertext may
                    // belong to a previous APP_KEY and must not be destroyed.
                }

                if (! $this->isJsonObject($integration->data)) {
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
        // Encryption repair is intentionally irreversible.
    }

    private function isJsonObject(string $value): bool
    {
        $decoded = json_decode($value, true);

        return json_last_error() === JSON_ERROR_NONE && is_array($decoded);
    }
};
