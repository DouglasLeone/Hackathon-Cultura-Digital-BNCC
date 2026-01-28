import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';
import { Button } from '@/view/components/ui/button';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

export const GuidedTour: React.FC = () => {
    const { isActive, currentStep, steps, nextStep, prevStep, endTour, targetRect, isReady } = useTour();

    const step = useMemo(() => steps?.[currentStep], [steps, currentStep]);

    const TOOLTIP_WIDTH = 288; // w-72 = 18rem = 288px
    const PADDING = 24;

    const finalStyle = useMemo(() => {
        if (!isActive || !targetRect || !isReady || !step) return { top: 0, left: 0, transform: 'translate(0, 0)', opacity: 0, arrowOffset: 0, side: 'center' };

        const viewportWidth = window.innerWidth;
        const pad = 16;
        const tooltipWidth = TOOLTIP_WIDTH;

        // Calculate Target Center
        const targetCenterX = targetRect.left + targetRect.width / 2;
        const targetCenterY = targetRect.top + targetRect.height / 2;

        // Base coordinates (Top-Left of the tooltip box)
        let top = 0;
        let left = 0;
        let side = step.position;

        // 1. Determine Initial Layout
        switch (step.position) {
            case 'top':
                // Position above, centered horizontally
                top = targetRect.top - PADDING;
                left = targetCenterX - tooltipWidth / 2;
                break;
            case 'bottom':
                // Position below, centered horizontally
                top = targetRect.bottom + PADDING;
                left = targetCenterX - tooltipWidth / 2;
                break;
            case 'left':
                // Position left, centered vertically
                top = targetCenterY;
                left = targetRect.left - PADDING - tooltipWidth;
                break;
            case 'right':
                // Position right, centered vertically
                top = targetCenterY;
                left = targetRect.right + PADDING;
                break;
        }

        // 2. Flip Logic (Horizontal only for now)
        if (step.position === 'right' && left + tooltipWidth > viewportWidth - pad) {
            side = 'left';
            left = targetRect.left - PADDING - tooltipWidth;
        }
        if (step.position === 'left' && left < pad) {
            side = 'right';
            left = targetRect.right + PADDING;
        }

        // 3. Horizontal Clamping (Hard constraint)
        // 3. Horizontal Clamping (Hard constraint)
        // Estimate height for vertical clamping (approximate)
        const tooltipHeight = 220;

        // Clamp horizontal
        left = Math.max(pad, Math.min(left, viewportWidth - tooltipWidth - pad));

        // Clamp vertical
        // Initial top is centered on targetCenterY (for left/right) or above/below target (for top/bottom)
        // We need to resolve 'transform' to clamp accurately.
        let estimatedTop = top;
        if (side === 'top') estimatedTop -= tooltipHeight;
        else if (side === 'left' || side === 'right') estimatedTop -= tooltipHeight / 2;

        // Apply vertical clamping safe margin
        const viewportHeight = window.innerHeight;
        const clampedTop = Math.max(pad, Math.min(estimatedTop, viewportHeight - tooltipHeight - pad));

        // Shift 'top' by the difference
        const shiftY = clampedTop - estimatedTop;
        top += shiftY;

        // 4. Transform Logic
        let transform = '';
        if (side === 'top') transform = 'translate(0, -100%)';
        else if (side === 'bottom') transform = 'translate(0, 0)';
        else transform = 'translate(0, -50%)'; // left/right

        // 5. Arrow Calculation
        // Horizontal Arrow Offset (for top/bottom placement)
        const currentTooltipCenterX = left + tooltipWidth / 2;
        let arrowOffset = targetCenterX - currentTooltipCenterX;

        // Vertical Arrow Offset (for left/right placement)
        // We need the arrow Y relative to the tooltip center Y
        // Current tooltip center Y
        // If side is left/right, base top was targetCenterY. New top is targetCenterY + shiftY.
        // The tooltip center Y is actually determined by `top` + transform.
        // If transform is -50%, center Y is `top`.
        const currentTooltipCenterY = top;
        let arrowOffsetY = targetCenterY - currentTooltipCenterY;

        // Clamp arrows
        const maxArrowOffset = (tooltipWidth / 2) - 24;
        const maxArrowOffsetY = (tooltipHeight / 2) - 24;

        arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, arrowOffset));
        arrowOffsetY = Math.max(-maxArrowOffsetY, Math.min(maxArrowOffsetY, arrowOffsetY));

        return { top, left, transform, side, arrowOffset, arrowOffsetY, opacity: 1 };
    }, [isActive, targetRect, isReady, step]);

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
                                    : undefined,
                                top: (finalStyle.side === 'left' || finalStyle.side === 'right')
                                    ? `calc(50% + ${finalStyle.arrowOffsetY || 0}px)`
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
