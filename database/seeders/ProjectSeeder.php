<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'admin@tyto.local'],
            ['name' => 'Admin', 'password' => bcrypt('password')]
        );

        if (! $user->currentTeam) {
            $team = $user->ownedTeams()->create([
                'name' => 'Main Team',
                'slug' => 'main-team',
                'is_personal' => false,
            ]);
            $user->forceFill(['current_team_id' => $team->id])->save();
        }

        $team = $user->currentTeam;

        $project = Project::updateOrCreate(
            ['slug' => 'test-project'],
            [
                'team_id' => $team->id,
                'name' => 'Tyto Test',
                'api_token' => 'tyto_test_token',
                'url' => 'http://localhost:8000',
            ]
        );

        // Seed some dummy records
        $project->records()->create([
            'type' => 'request',
            'payload' => [
                'method' => 'GET',
                'uri' => '/api/users',
                'status' => 200,
                'duration' => 120,
                'ip' => '127.0.0.1',
            ],
            'created_at' => now()->subMinutes(10),
        ]);

        $project->records()->create([
            'type' => 'exception',
            'payload' => [
                'class' => 'Illuminate\\Database\\QueryException',
                'message' => 'SQLSTATE[23000]: Integrity constraint violation',
                'file' => 'app/Http/Controllers/UserController.php',
                'line' => 42,
                'trace' => [],
            ],
            'created_at' => now()->subMinutes(5),
        ]);

        $project->records()->create([
            'type' => 'query',
            'payload' => [
                'connection' => 'mysql',
                'sql' => 'select * from users where id = 1',
                'time' => 15.5,
            ],
            'created_at' => now()->subMinutes(2),
        ]);
    }
}
