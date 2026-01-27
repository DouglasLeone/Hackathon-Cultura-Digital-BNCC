import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';
import { Button } from '@/view/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export const GuidedTour: React.FC = () => {
    const { isActive, currentStep, steps, nextStep, prevStep, endTour, targetRect } = useTour();

    if (!isActive || !steps[currentStep]) return null;

    const step = steps[currentStep];

    // Calculate tooltip position
    const getTooltipStyle = () => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const padding = 12;
        switch (step.position) {
            case 'top':
                return {
                    top: targetRect.top - padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translate(-50%, -100%)'
                };
            case 'bottom':
                return {
                    top: targetRect.bottom + padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translate(-50%, 0)'
                };
            case 'left':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left - padding,
                    transform: 'translate(-100%, -50%)'
                };
            case 'right':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + padding,
                    transform: 'translate(0, -50%)'
                };
            default:
                return {};
        }
    };

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none">
            {/* Dimmed Background with Spotlight */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {targetRect && (
                            <motion.rect
                                initial={false}
                                animate={{
                                    x: targetRect.left - 8,
                                    y: targetRect.top - 8,
                                    width: targetRect.width + 16,
                                    height: targetRect.height + 16,
                                    rx: 12
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#spotlight-mask)" className="pointer-events-auto" onClick={endTour} />
            </svg>

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    style={getTooltipStyle()}
                    className="absolute z-[120] w-72 bg-card border shadow-2xl rounded-2xl p-5 pointer-events-auto"
                >
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-primary">{step.title}</h4>
                        <Button variant="ghost" size="icon" onClick={endTour} className="h-6 w-6 -mr-2 -mt-2">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                        {step.content}
                    </p>
                    <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-muted-foreground">
                            Passo {currentStep + 1} de {steps.length}
                        </div>
                        <div className="flex gap-2">
                            {currentStep > 0 && (
                                <Button variant="outline" size="sm" onClick={prevStep} className="h-8 px-2">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                            )}
                            <Button size="sm" onClick={nextStep} className="h-8 px-4 font-semibold">
                                {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                                {currentStep < steps.length - 1 && <ChevronRight className="ml-1 w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    {/* Arrow */}
                    <div
                        className={`absolute w-3 h-3 bg-card border-t border-l rotate-45 
              ${step.position === 'top' ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-t-0 border-l-0 border-r border-b' : ''}
              ${step.position === 'bottom' ? 'top-[-7px] left-1/2 -translate-x-1/2' : ''}
              ${step.position === 'left' ? 'right-[-7px] top-1/2 -translate-y-1/2 border-t-0 border-l-0 border-r border-b rotate-[-45deg]' : ''}
              ${step.position === 'right' ? 'left-[-7px] top-1/2 -translate-y-1/2 border-t border-l rotate-[-45deg]' : ''}
            `}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
