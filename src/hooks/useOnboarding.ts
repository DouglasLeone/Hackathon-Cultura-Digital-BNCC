import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'aula_criativa_onboarding_completed';

export const useOnboarding = () => {
    const [showTutorial, setShowTutorial] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(ONBOARDING_KEY);
        if (!completed) {
            setShowTutorial(true);
        }
        setIsLoading(false);
    }, []);

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setShowTutorial(false);
    };

    const restartOnboarding = () => {
        localStorage.removeItem(ONBOARDING_KEY);
        setShowTutorial(true);
    };

    return {
        showTutorial,
        isLoading,
        completeOnboarding,
        restartOnboarding
    };
};
