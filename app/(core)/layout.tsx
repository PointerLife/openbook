import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'sonner';
import './globals.css';
import { Providers } from '../(config)/providers';
import { SpacesProvider } from '@/contexts/SpacesContext';
import { NotebookProvider } from '@/contexts/NotebookContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import SidebarLayout from './SidebarLayout';

export default function CoreLayout({
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
                            <SidebarLayout>
                                {children}
                            </SidebarLayout>
                        </SpacesProvider>
                    </SettingsProvider>
                </NotebookProvider>
            </Providers>
            <Analytics />
            <SpeedInsights />
        </NuqsAdapter>
    );
}
