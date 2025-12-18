import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import '../(core)/globals.css';
import { Providers } from '../(config)/providers';
import { SpacesProvider } from '@/contexts/SpacesContext';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function SpaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <NuqsAdapter>
            <Providers>
                <NotebookProvider>
                    <SettingsProvider>
                        <SpacesProvider>
                            <Toaster position="top-center" />
                            {children}
                        </SpacesProvider>
                    </SettingsProvider>
                </NotebookProvider>
            </Providers>
            <Analytics />
            <SpeedInsights />
        </NuqsAdapter>
    );
} 