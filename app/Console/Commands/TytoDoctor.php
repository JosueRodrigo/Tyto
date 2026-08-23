<?php

namespace App\Console\Commands;

use App\Services\ProductionReadinessService;
use Illuminate\Console\Command;

class TytoDoctor extends Command
{
    protected $signature = 'tyto:doctor {--json : Render the result as JSON}';

    protected $description = 'Check whether Tyto production dependencies are healthy';

    public function handle(ProductionReadinessService $readiness): int
    {
        $result = $readiness->inspect();

        if ($this->option('json')) {
            $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        } else {
            $this->components->twoColumnDetail('Tyto readiness', $result['status']);

            foreach ($result['checks'] as $name => $check) {
                $this->components->twoColumnDetail($name, $check['ok'] ? '<fg=green>OK</>' : '<fg=red>'.$check['message'].'</>');
            }
        }

        return $result['status'] === 'ready' ? self::SUCCESS : self::FAILURE;
    }
}
