import { useState } from 'react';
import { Button } from '@/view/components/ui/button';
import { Loader2, Sparkles, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/view/components/ui/card';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/view/components/ui/alert';

interface UnidadeAISelectionProps {
    onGenerate: () => Promise<string[]>;
    onSelect: (tema: string) => void;
    onCancel: () => void;
}

export function UnidadeAISelection({ onGenerate, onSelect, onCancel }: UnidadeAISelectionProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasGenerated, setHasGenerated] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await onGenerate();
            if (result && result.length > 0) {
                setSuggestions(result);
                setHasGenerated(true);
            } else {
                setError('A IA não retornou sugestões. Tente novamente.');
            }
        } catch (e) {
            setError('Falha ao gerar sugestões. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    if (!hasGenerated && !loading) {
        return (
            <div className="py-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-xl font-semibold">Assistente de Conteúdo</h3>
                    <p className="text-muted-foreground">
                        A IA analisará a disciplina e a BNCC para sugerir temas relevantes e engajadores para suas unidades de ensino.
                    </p>
                </div>

                {error && (
                    <Alert variant="destructive" className="max-w-md mx-auto text-left">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Gerar Sugestões
                    </Button>
                    <Button variant="ghost" onClick={onCancel}>
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-12 text-center space-y-4">
                <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-muted border-t-purple-600 animate-spin" />
                </div>
                <div>
                    <h3 className="text-lg font-medium animate-pulse">Consultando a Base de Conhecimento...</h3>
                    <p className="text-sm text-muted-foreground mt-1">Analisando BNCC e contexto escolar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="font-medium text-lg">Sugestões Geradas</h3>
                    <p className="text-sm text-muted-foreground">Selecione um tema para começar a editar</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Novas Sugestões
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                {suggestions.map((suggestion, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card
                            className="cursor-pointer hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 transition-all group"
                            onClick={() => onSelect(suggestion)}
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <span className="font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300">
                                    {suggestion}
                                </span>
                                <CheckCircle2 className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-purple-600 transition-all" />
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Button variant="outline" className="w-full" onClick={onCancel}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Button>
        </div>
    );
}
