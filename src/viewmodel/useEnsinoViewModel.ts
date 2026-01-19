
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { NivelEnsino, UserContext, AREAS_CONHECIMENTO_FUNDAMENTAL, AREAS_CONHECIMENTO_MEDIO } from '../model/entities';

export const useEnsinoViewModel = () => {
    const [loading, setLoading] = useState(true);
    const [areas, setAreas] = useState<string[]>([]);

    const getUserId = () => localStorage.getItem('user_id') || '';

    useEffect(() => {
        const loadAreas = async () => {
            setLoading(true);
            try {
                const userId = getUserId();
                let userNiveis: NivelEnsino[] = [];

                if (userId) {
                    const ctx = await DIContainer.getUserContextUseCase.execute(userId);
                    if (ctx) {
                        userNiveis = ctx.niveis_ensino;
                    }
                }

                // Aggregate areas based on selected levels
                const availableAreas = new Set<string>();
                if (userNiveis.includes('Ensino Fundamental')) {
                    AREAS_CONHECIMENTO_FUNDAMENTAL.forEach(a => availableAreas.add(a));
                }
                if (userNiveis.includes('Ensino Médio')) {
                    AREAS_CONHECIMENTO_MEDIO.forEach(a => availableAreas.add(a));
                }

                setAreas(Array.from(availableAreas));

            } catch (error) {
                console.error("Error loading areas:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAreas();
    }, []);

    return {
        loading,
        areas
    };
};
