import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * 
 * Captura erros de renderização em componentes React e exibe UI de fallback
 * em vez de quebrar toda a aplicação.
 * 
 * Limitação: Não captura erros em:
 * - Event handlers (use try/catch)
 * - Código assíncrono (use try/catch em hooks)
 * - Server-side rendering
 * - Erros no próprio error boundary
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('🚨 Error caught by ErrorBoundary:', error);
        console.error('Component Stack:', errorInfo.componentStack);

        this.setState({ errorInfo });

        // TODO: Enviar para serviço de logging (ex: Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <ErrorFallback
                    error={this.state.error}
                    onReset={this.handleReset}
                />
            );
        }

        return this.props.children;
    }
}

interface ErrorFallbackProps {
    error?: Error;
    onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
    const isDevelopment = import.meta.env.DEV;

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="max-w-2xl w-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-destructive" />
                        <div>
                            <CardTitle className="text-2xl">Algo deu errado</CardTitle>
                            <CardDescription>
                                Ocorreu um erro inesperado na aplicação
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDevelopment && error && (
                        <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
                            <div className="font-semibold text-destructive">
                                {error.name}: {error.message}
                            </div>
                            {error.stack && (
                                <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                                    {error.stack}
                                </pre>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Button onClick={onReset} className="flex-1">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tentar Novamente
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="flex-1"
                        >
                            Voltar ao Início
                        </Button>
                    </div>

                    {!isDevelopment && (
                        <p className="text-sm text-muted-foreground text-center">
                            Se o problema persistir, tente recarregar a página ou entre em contato com o suporte.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
