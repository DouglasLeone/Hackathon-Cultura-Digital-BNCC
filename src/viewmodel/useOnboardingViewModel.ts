import { useState, useEffect } from 'react';
import { useDI } from '../di/useDI';
import { NivelEnsino } from '../model/entities/BNCC';

export const useOnboardingViewModel = () => {
    const { getUserContextUseCase, createUserContextUseCase } = useDI();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [niveis, setNiveis] = useState<NivelEnsino[]>([]);
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
        const nivel = level as NivelEnsino;
        setNiveis(prev =>
            prev.includes(nivel)
                ? prev.filter(l => l !== nivel)
                : [...prev, nivel]
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
            await createUserContextUseCase.execute(userId, niveis);
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
