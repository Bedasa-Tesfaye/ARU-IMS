import './bootstrap';
import '../css/app.css';
import './globals.css';

import React from 'react';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AIChatBot from './components/AIChatBot';

createInertiaApp({
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const importer = pages[`./Pages/${name}.jsx`];

        if (!importer) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        const pageModule = await importer();
        const Page = pageModule.default;

        function PageWithGlobalChat(pageProps) {
            return (
                <>
                    <Page {...pageProps} />
                    <AIChatBot />
                </>
            );
        }

        PageWithGlobalChat.layout = Page.layout;

        return { ...pageModule, default: PageWithGlobalChat };
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
