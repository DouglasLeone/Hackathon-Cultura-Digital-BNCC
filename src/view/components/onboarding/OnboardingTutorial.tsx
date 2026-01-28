import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Sparkles,
    GraduationCap,
    CheckCircle2,
    ChevronRight,
    X,
    Target,
    Zap
} from 'lucide-react';
import { Button } from '@/view/components/ui/button';
import { Progress } from '@/view/components/ui/progress';
import { TourStep, useTour } from './TourProvider';
import { useDI } from '@/di/useDI';

interface Step {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
}

const steps: Step[] = [
    {
        title: "Bem-vindo à Aula Criativa AI",
        description: "Sua plataforma definitiva para gerar materiais didáticos premium alinhados à BNCC em segundos.",
        icon: <Sparkles className="w-12 h-12 text-primary" />,
        color: "from-primary/20 to-primary/5"
    },
    {
        title: "Organize por Disciplinas",
        description: "Cadastre suas matérias e deixe que nossa IA ajude a estruturar seu ano letivo com sugestões inteligentes.",
        icon: <BookOpen className="w-12 h-12 text-blue-500" />,
        color: "from-blue-500/20 to-blue-500/5"
    },
    {
        title: "IA Pedagógica de Elite",
        description: "Gere planos de aula, atividades e slides com foco em Cultura Digital e alternativas desplugadas.",
        icon: <Zap className="w-12 h-12 text-yellow-500" />,
        color: "from-yellow-500/20 to-yellow-500/5"
    },
    {
        title: "Rigor BNCC Garantido",
        description: "Acesso a 17.357 habilidades oficiais e um validador de qualidade que analisa seu material em tempo real.",
        icon: <Target className="w-12 h-12 text-green-500" />,
        color: "from-green-500/20 to-green-500/5"
    }
];

interface OnboardingTutorialProps {
    onComplete: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const { startTour } = useTour();
    const { getAllDisciplinasUseCase, getUnidadesByDisciplinaUseCase, getUserContextUseCase } = useDI();

    const buildDynamicTourSteps = async (): Promise<TourStep[]> => {
        const tourSteps: TourStep[] = [
            {
                target: "tour-sidebar-disciplinas",
                title: "Suas Disciplinas",
                content: "Aqui você gerencia todas as matérias que você leciona.",
                position: "right",
                path: "/"
            },
            {
                target: "tour-new-disciplina",
                title: "Criar Disciplina",
                content: "Clique aqui para cadastrar uma nova disciplina ou área de conhecimento.",
                position: "bottom",
                path: "/disciplinas"
            }
        ];

        try {
            const userId = localStorage.getItem('user_id');
            if (!userId) return tourSteps; // Return basic tour if no user

            // Fetch user's disciplines using usecase
            let disciplinas = await getAllDisciplinasUseCase.execute();

            // Filter by user context if needed (simulating ViewModel logic)
            const ctx = await getUserContextUseCase.execute(userId);
            if (ctx && ctx.niveis_ensino && ctx.niveis_ensino.length > 0) {
                // Basic filtering to ensure we get relevant disciplines
                disciplinas = disciplinas.filter(d => ctx.niveis_ensino.includes(d.nivel as any));
            }

            if (disciplinas.length > 0) {
                const firstDisciplina = disciplinas[0];

                // Add step 3: Navigate to first discipline
                tourSteps.push({
                    target: "tour-new-unidade",
                    title: "Adicionar Unidade",
                    content: "Dentro de cada disciplina, use este botão para criar novos tópicos ou unidades de ensino.",
                    position: "bottom",
                    path: `/disciplinas/${firstDisciplina.id}`
                });

                // Step 4 removed as per user request
            }
        } catch (error) {
            console.error("Error building dynamic tour steps:", error);
        }

        return tourSteps;
    };

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();

            // Build dynamic tour steps based on user data
            const dynamicTourSteps = await buildDynamicTourSteps();
            startTour(dynamicTourSteps);
        }
    };

    const progress = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-lg overflow-hidden bg-card rounded-3xl border shadow-2xl"
            >
                {/* Step Background Gradient */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 bg-gradient-to-br ${steps[currentStep].color} transition-colors duration-500`}
                    />
                </AnimatePresence>

                <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-6">
                    {/* Header */}
                    <div className="w-full flex justify-between items-center mb-4">
                        <Progress value={progress} className="h-1.5 w-full mr-4" />
                        <Button variant="ghost" size="icon" onClick={onComplete} className="shrink-0 -mr-2">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Icon Animation */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 20 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="p-6 bg-background rounded-full shadow-lg"
                        >
                            {steps[currentStep].icon}
                        </motion.div>
                    </AnimatePresence>

                    {/* Text Content */}
                    <div className="space-y-3 min-h-[140px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    {steps[currentStep].title}
                                </h2>
                                <p className="mt-2 text-muted-foreground leading-relaxed">
                                    {steps[currentStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="w-full pt-4 flex gap-3">
                        {currentStep > 0 ? (
                            <Button
                                variant="outline"
                                onClick={() => setCurrentStep(prev => prev - 1)}
                                className="flex-1 rounded-xl py-6"
                            >
                                Anterior
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={onComplete}
                                className="flex-1 rounded-xl py-6 text-muted-foreground"
                            >
                                Pular Tutorial
                            </Button>
                        )}

                        <Button
                            onClick={handleNext}
                            className="flex-[2] rounded-xl py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                        >
                            {currentStep === steps.length - 1 ? (
                                <>Começar Agora <CheckCircle2 className="ml-2 w-5 h-5" /></>
                            ) : (
                                <>Continuar <ChevronRight className="ml-2 w-5 h-5" /></>
                            )}
                        </Button>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex gap-1.5 pt-2">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-primary/20'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
