
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { NivelEnsino, UserContext } from '../model/entities';

export const useOnboardingViewModel = () => {
    const [userContext, setUserContext] = useState<UserContext | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [niveis, setNiveis] = useState<NivelEnsino[]>([]);

    // Simulate User ID (persist in local storage for now to link to Firestore doc)
    const getUserId = () => {
        let uid = localStorage.getItem('user_id');
        if (!uid) {
            uid = 'user_' + Math.random().toString(36).substring(2, 9);
            localStorage.setItem('user_id', uid);
        }
        return uid;
    };

    const userId = getUserId();

    useEffect(() => {
        const checkUserContext = async () => {
            try {
                const ctx = await DIContainer.getUserContextUseCase.execute(userId);
                if (ctx) {
                    setUserContext(ctx);
                    setShowOnboarding(false);
                } else {
                    setShowOnboarding(true);
                }
            } catch (error) {
                console.error("Error fetching user context:", error);
                // Fallback to onboarding if error? or fail silently
            } finally {
                setLoading(false);
            }
        };
        checkUserContext();
    }, [userId]);

    const handleSaveLevels = async () => {
        if (niveis.length === 0) return; // Must select at least one
        setLoading(true);
        try {
            const ctx = await DIContainer.createUserContextUseCase.execute(userId, niveis);
            setUserContext(ctx);
            setShowOnboarding(false);
        } catch (error) {
            console.error("Error saving context:", error);
            alert("Erro ao salvar suas preferências. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const toggleNivel = (nivel: NivelEnsino) => {
        setNiveis(prev =>
            prev.includes(nivel)
                ? prev.filter(n => n !== nivel)
                : [...prev, nivel]
        );
    };

    return {
        showOnboarding,
        loading,
        niveis,
        toggleNivel,
        handleSaveLevels,
        userContext
    };
};
