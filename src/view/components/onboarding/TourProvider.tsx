import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TourStep {
    target: string; // CSS selector or data-tour attribute value
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

interface TourContextType {
    isActive: boolean;
    currentStep: number;
    steps: TourStep[];
    startTour: (steps: TourStep[]) => void;
    nextStep: () => void;
    prevStep: () => void;
    endTour: () => void;
    targetRect: DOMRect | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const updateTargetRect = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const element = document.querySelector(`[data-tour="${steps[currentStep].target}"]`) ||
            document.querySelector(steps[currentStep].target);

        if (element) {
            setTargetRect(element.getBoundingClientRect());
        } else {
            setTargetRect(null);
        }
    }, [isActive, currentStep, steps]);

    useEffect(() => {
        updateTargetRect();
        window.addEventListener('resize', updateTargetRect);
        window.addEventListener('scroll', updateTargetRect, true);
        return () => {
            window.removeEventListener('resize', updateTargetRect);
            window.removeEventListener('scroll', updateTargetRect, true);
        };
    }, [updateTargetRect]);

    const startTour = (newSteps: TourStep[]) => {
        setSteps(newSteps);
        setCurrentStep(0);
        setIsActive(true);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const endTour = () => {
        setIsActive(false);
        setTargetRect(null);
    };

    return (
        <TourContext.Provider value={{
            isActive,
            currentStep,
            steps,
            startTour,
            nextStep,
            prevStep,
            endTour,
            targetRect
        }}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = () => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error('useTour must be used within a TourProvider');
    }
    return context;
};
