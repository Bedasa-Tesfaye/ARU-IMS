import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: false,
        }),
        react({ jsxRuntime: 'classic' }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5177,
        strictPort: true,
        cors: true,
        hmr: {
            host: '127.0.0.1',
            port: 5177,
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
    build: {
        manifest: true,
    },
});

