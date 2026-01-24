import { useState, useEffect } from 'react';
import { useDI } from '../di/useDI';

export const useOnboardingViewModel = () => {
    const { getUserContextUseCase, createUserContextUseCase } = useDI();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [niveis, setNiveis] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkExisting = async () => {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                try {
                    const ctx = await getUserContextUseCase.execute(userId);
                    // If context exists and has levels, checking is done -> hide onboarding
                    if (ctx && ctx.niveis_ensino && ctx.niveis_ensino.length > 0) {
                        setShowOnboarding(false);
                    } else {
                        // User exists but has no levels (maybe partial setup) -> show onboarding
                        setShowOnboarding(true);
                    }
                } catch (error) {
                    console.error("Error loading context", error);
                }
            } else {
                // No user -> show onboarding
                setShowOnboarding(true);
            }
            setLoading(false);
        };
        checkExisting();
    }, [getUserContextUseCase]);

    const toggleNivel = (level: string) => {
        setNiveis(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const handleSaveLevels = async () => {
        if (niveis.length === 0) return;
        setLoading(true);
        // Ensure we have a user ID
        let userId = localStorage.getItem('user_id');
        if (!userId) {
            userId = crypto.randomUUID();
            localStorage.setItem('user_id', userId);
        }

        try {
            await createUserContextUseCase.execute(userId, niveis as any);
            setShowOnboarding(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        showOnboarding,
        loading,
        niveis,
        toggleNivel,
        handleSaveLevels
    };
};
