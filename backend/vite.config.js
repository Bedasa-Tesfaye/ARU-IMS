import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: false,
        }),
        react({ jsxRuntime: 'automatic' }),
    ],
    server: {
        host: '127.0.0.1',
        port: 5177,
        strictPort: true,
        cors: true,
        proxy: {
            // Proxy API and auth requests to the backend to avoid cross-origin cookie issues during dev
            '/api': 'http://127.0.0.1:8000',
            '/videos': 'http://127.0.0.1:8000',
            '/assets': 'http://127.0.0.1:8000',
            '/login': 'http://127.0.0.1:8000',
            '/logout': 'http://127.0.0.1:8000',
            '/me': 'http://127.0.0.1:8000',
            '/refresh': 'http://127.0.0.1:8000',
            '/superadmin': 'http://127.0.0.1:8000',
            '/student-dashboard': 'http://127.0.0.1:8000',
            '/examiner-dashboard': 'http://127.0.0.1:8000',
            '/advisor-dashboard': 'http://127.0.0.1:8000',
            '/company-dashboard': 'http://127.0.0.1:8000',
            '/admin': 'http://127.0.0.1:8000',
            '/applications': 'http://127.0.0.1:8000',
            '/internships': 'http://127.0.0.1:8000',
            '/reports': 'http://127.0.0.1:8000',
        },
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

