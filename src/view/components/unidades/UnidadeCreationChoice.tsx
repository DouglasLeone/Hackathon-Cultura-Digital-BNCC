import { Button } from '@/view/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/view/components/ui/card';
import { Brain, PenTool, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnidadeCreationChoiceProps {
    onManual: () => void;
    onAI: () => void;
}

export function UnidadeCreationChoice({ onManual, onAI }: UnidadeCreationChoiceProps) {
    return (
        <div className="space-y-6 py-4">
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium leading-none">Escolha como começar</h3>
                <p className="text-sm text-muted-foreground">
                    Você pode criar o conteúdo do zero ou deixar nossa IA ajudar você.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Card
                        className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col"
                        onClick={onAI}
                    >
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-2 dark:bg-indigo-900/30">
                                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <CardTitle className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                                Criar com IA
                            </CardTitle>
                            <CardDescription>
                                Sugestão automática de conteúdo
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-muted-foreground flex-1">
                            A IA estrutura temas, habilidades da BNCC e gera um esboço inicial para você revisar.
                        </CardContent>
                        <div className="p-4 pt-0 mt-auto">
                            <Button variant="default" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md">
                                <Brain className="mr-2 h-4 w-4" />
                                Usar Assistente
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Card
                        className="cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col"
                        onClick={onManual}
                    >
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 dark:bg-slate-800">
                                <PenTool className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <CardTitle>Manual</CardTitle>
                            <CardDescription>
                                Preencher do zero
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-muted-foreground flex-1">
                            Você define cada detalhe da unidade, temas e campos desde o início.
                        </CardContent>
                        <div className="p-4 pt-0 mt-auto">
                            <Button variant="outline" className="w-full">
                                Criar Manualmente
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
