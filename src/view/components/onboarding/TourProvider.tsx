import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export interface TourStep {
    target: string; // CSS selector or data-tour attribute value
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    path?: string; // Optional path to navigate to before showing this step
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
    isReady: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<TourStep[]>([]);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isReady, setIsReady] = useState(false);
    const navigate = useNavigate();
    const observerRef = useRef<MutationObserver | null>(null);

    const updateTargetRect = useCallback(() => {
        if (!isActive || !steps[currentStep]) return;

        const selector = steps[currentStep].target;
        const element = document.querySelector(`[data-tour="${selector}"]`) ||
            document.querySelector(selector);

        if (element) {
            setTargetRect(element.getBoundingClientRect());
            setIsReady(true);
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            setTargetRect(null);
            setIsReady(false);
        }
    }, [isActive, currentStep, steps]);

    // Handle navigation and element waiting
    useEffect(() => {
        if (!isActive || !steps[currentStep]) return;

        const step = steps[currentStep];

        const checkElement = () => {
            const element = document.querySelector(`[data-tour="${step.target}"]`) ||
                document.querySelector(step.target);
            if (element) {
                updateTargetRect();
                return true;
            }
            return false;
        };

        if (step.path && window.location.pathname !== step.path) {
            setIsReady(false);
            navigate(step.path);
            // Wait for navigation and potential lazy loading
            const timer = setInterval(() => {
                if (checkElement()) clearInterval(timer);
            }, 500);
            return () => clearInterval(timer);
        } else {
            if (!checkElement()) {
                // If not found immediately, start observing or polling
                const timer = setInterval(() => {
                    if (checkElement()) clearInterval(timer);
                }, 500);
                return () => clearInterval(timer);
            }
        }
    }, [isActive, currentStep, steps, navigate, updateTargetRect]);

    useEffect(() => {
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
        setIsReady(false);
    };

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setIsReady(false);
            setCurrentStep(prev => prev + 1);
        } else {
            endTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setIsReady(false);
            setCurrentStep(prev => prev - 1);
        }
    };

    const endTour = () => {
        setIsActive(false);
        setTargetRect(null);
        setIsReady(false);
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
            targetRect,
            isReady
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
