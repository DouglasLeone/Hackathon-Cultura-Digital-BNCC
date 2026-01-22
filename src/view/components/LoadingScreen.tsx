import { Loader2 } from 'lucide-react';

/**
 * Loading Screen Component
 * 
 * Fallback UI exibido durante o lazy loading de routes.
 * Usado com React.Suspense.
 */
export const LoadingScreen = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        </div>
    );
};
