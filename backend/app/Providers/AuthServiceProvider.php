<?php

namespace App\Providers;

use App\Support\Authority;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        $permissions = array_keys((array) config('authority.permissions', []));

        foreach ($permissions as $permission) {
            Gate::define($permission, fn ($user) => Authority::allows($user, $permission));
        }
    }
}
