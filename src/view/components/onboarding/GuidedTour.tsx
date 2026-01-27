import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';
import { Button } from '@/view/components/ui/button';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export const GuidedTour: React.FC = () => {
    const { isActive, currentStep, steps, nextStep, prevStep, endTour, targetRect, isReady } = useTour();
    const [tooltipCoords, setTooltipCoords] = useState({ top: 0, left: 0, arrowShift: 0 });

    const step = useMemo(() => steps?.[currentStep], [steps, currentStep]);

    const TOOLTIP_WIDTH = 288; // w-72 = 18rem = 288px
    const PADDING = 12;

    // Calculate position and adjust for viewport boundaries
    useEffect(() => {
        if (!isActive || !targetRect || !isReady || !step) return;

        let top = 0;
        let left = 0;
        let arrowShift = 0;

        const viewportWidth = window.innerWidth;

        // Initial preferred position
        switch (step.position) {
            case 'top':
                top = targetRect.top - PADDING;
                left = targetRect.left + targetRect.width / 2;
                break;
            case 'bottom':
                top = targetRect.bottom + PADDING;
                left = targetRect.left + targetRect.width / 2;
                break;
            case 'left':
                top = targetRect.top + targetRect.height / 2;
                left = targetRect.left - PADDING;
                break;
            case 'right':
                top = targetRect.top + targetRect.height / 2;
                left = targetRect.right + PADDING;
                break;
        }

        // Boundary adjustment (Horizontal)
        if (step.position === 'top' || step.position === 'bottom') {
            const minLeft = TOOLTIP_WIDTH / 2 + PADDING;
            const maxLeft = viewportWidth - (TOOLTIP_WIDTH / 2 + PADDING);

            if (left < minLeft) {
                arrowShift = left - minLeft;
                left = minLeft;
            } else if (left > maxLeft) {
                arrowShift = left - maxLeft;
                left = maxLeft;
            }
        } else {
            // position is left or right
            if (step.position === 'right' && left + TOOLTIP_WIDTH > viewportWidth - PADDING) {
                left = Math.max(PADDING + TOOLTIP_WIDTH / 2, viewportWidth - TOOLTIP_WIDTH - PADDING);
            }
        }

        setTooltipCoords({ top, left, arrowShift });
    }, [isActive, targetRect, isReady, step]);

    const getTooltipStyle = useCallback(() => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', side: 'center', arrowOffset: 0 };

        const { top, left } = tooltipCoords;
        if (!step) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', side: 'center', arrowOffset: 0 };

        switch (step.position) {
            case 'top':
                return { top, left, transform: 'translate(-50%, -100%)', side: 'top', arrowOffset: 0 };
            case 'bottom':
                return { top, left, transform: 'translate(-50%, 0)', side: 'bottom', arrowOffset: 0 };
            case 'left':
                return { top, left, transform: 'translate(-100%, -50%)', side: 'left', arrowOffset: 0 };
            case 'right':
                return { top: targetRect.top + targetRect.height / 2, left: Math.min(left, window.innerWidth - TOOLTIP_WIDTH - PADDING), transform: 'translate(0, -50%)', side: 'right', arrowOffset: 0 };
            default:
                return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', side: 'center', arrowOffset: 0 };
        }
    }, [targetRect, step, tooltipCoords]);

    // Refined right-side positioning specifically for elements near the right edge
    const finalStyle = useMemo(() => {
        if (!isActive || !targetRect || !isReady || !step) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', side: 'center', arrowOffset: 0 };

        const viewportWidth = window.innerWidth;
        const pad = 16;

        if (step.position === 'right') {
            const left = targetRect.right + PADDING;
            if (left + TOOLTIP_WIDTH > viewportWidth - pad) {
                // Flip to left if no room on right
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left - PADDING,
                    transform: 'translate(-100%, -50%)',
                    side: 'left',
                    arrowOffset: 0
                };
            }
            return {
                top: targetRect.top + targetRect.height / 2,
                left: left,
                transform: 'translate(0, -50%)',
                side: 'right',
                arrowOffset: 0
            };
        }

        if (step.position === 'left') {
            const left = targetRect.left - PADDING;
            if (left - TOOLTIP_WIDTH < pad) {
                // Flip to right if no room on left
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + PADDING,
                    transform: 'translate(0, -50%)',
                    side: 'right',
                    arrowOffset: 0
                };
            }
            return {
                top: targetRect.top + targetRect.height / 2,
                left: left,
                transform: 'translate(-100%, -50%)',
                side: 'left',
                arrowOffset: 0
            };
        }

        // Handle top/bottom with horizontal shifting
        if (step.position === 'top' || step.position === 'bottom') {
            let left = targetRect.left + targetRect.width / 2;
            let transformX = -50;

            // Constrain left
            const halfWidth = TOOLTIP_WIDTH / 2;
            if (left - halfWidth < pad) {
                left = pad;
                transformX = 0;
            } else if (left + halfWidth > viewportWidth - pad) {
                left = viewportWidth - pad;
                transformX = -100;
            }

            return {
                top: step.position === 'top' ? targetRect.top - PADDING : targetRect.bottom + PADDING,
                left: left,
                transform: `translate(${transformX}%, ${step.position === 'top' ? '-100%' : '0'})`,
                side: step.position,
                arrowOffset: transformX === 0 ? (targetRect.left + targetRect.width / 2 - pad) : (transformX === -100 ? (targetRect.left + targetRect.width / 2 - (viewportWidth - pad)) : 0)
            };
        }

        return getTooltipStyle();
    }, [isActive, targetRect, isReady, step, getTooltipStyle]);

    if (!isActive || !steps || steps.length === 0 || !step) return null;

    return (
        <div className="fixed inset-0 z-[110] pointer-events-none">
            {/* Dimmed Background with Spotlight */}
            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <mask id="spotlight-mask">
                        <rect width="100%" height="100%" fill="white" />
                        {isReady && targetRect && (
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
                {isReady ? (
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        style={{
                            position: 'absolute',
                            top: finalStyle.top,
                            left: finalStyle.left,
                            transform: finalStyle.transform,
                        }}
                        className="z-[120] w-72 bg-card border shadow-2xl rounded-2xl p-5 pointer-events-auto"
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
                                <Button size="sm" onClick={nextStep} className="h-8 px-4 font-semibold text-white bg-primary hover:bg-primary/90">
                                    {currentStep === steps.length - 1 ? 'Finalizar' : 'Próximo'}
                                    {currentStep < steps.length - 1 && <ChevronRight className="ml-1 w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Arrow */}
                        <div
                            className={`absolute w-3 h-3 bg-card border-t border-l rotate-45 
                                ${finalStyle.side === 'top' ? 'bottom-[-7px] border-t-0 border-l-0 border-r border-b' : ''}
                                ${finalStyle.side === 'bottom' ? 'top-[-7px]' : ''}
                                ${finalStyle.side === 'left' ? 'right-[-7px] top-1/2 -translate-y-1/2 border-t-0 border-l-0 border-r border-b rotate-[-45deg]' : ''}
                                ${finalStyle.side === 'right' ? 'left-[-7px] top-1/2 -translate-y-1/2 border-t border-l rotate-[-45deg]' : ''}
                            `}
                            style={{
                                left: (finalStyle.side === 'top' || finalStyle.side === 'bottom')
                                    ? `calc(50% + ${finalStyle.arrowOffset || 0}px)`
                                    : undefined
                            }}
                        />
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
