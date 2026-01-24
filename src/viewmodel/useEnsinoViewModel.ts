
import { useState, useEffect } from 'react';
import { useDI } from '../di/useDI';

// Hardcoded areas for simplicity or fetch from domain constants
const AREAS_FUNDAMENTAL = ['Linguagens', 'Matemática', 'Ciências da Natureza', 'Ciências Humanas', 'Ensino Religioso'];
const AREAS_MEDIO = ['Linguagens e suas Tecnologias', 'Matemática e suas Tecnologias', 'Ciências da Natureza e suas Tecnologias', 'Ciências Humanas e Sociais Aplicadas'];

export const useEnsinoViewModel = () => {
    const { getUserContextUseCase, createUserContextUseCase, updateUserContextUseCase } = useDI();
    const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContext = async () => {
            const userId = localStorage.getItem('user_id');
            if (userId) {
                try {
                    const ctx = await getUserContextUseCase.execute(userId);
                    if (ctx) {
                        setSelectedLevels(ctx.niveis_ensino);
                    }
                } catch (error) {
                    console.error('Error loading user context:', error);
                }
            }
            setLoading(false);
        };
        loadContext();
    }, [getUserContextUseCase]);

    const toggleLevel = (level: string) => {
        setSelectedLevels(prev =>
            prev.includes(level)
                ? prev.filter(l => l !== level)
                : [...prev, level]
        );
    };

    const savePreferences = async () => {
        setLoading(true);
        const userId = localStorage.getItem('user_id') || crypto.randomUUID();
        localStorage.setItem('user_id', userId);

        try {
            const existing = await getUserContextUseCase.execute(userId);
            if (existing) {
                await updateUserContextUseCase.execute(userId, selectedLevels as any);
            } else {
                await createUserContextUseCase.execute(userId, selectedLevels as any);
            }
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Calculate unique areas based on selection
    const areas = Array.from(new Set([
        ...(selectedLevels.includes('Ensino Fundamental') ? AREAS_FUNDAMENTAL : []),
        ...(selectedLevels.includes('Ensino Médio') ? AREAS_MEDIO : [])
    ])).sort();

    return {
        selectedLevels,
        loading,
        toggleLevel,
        savePreferences,
        hasSelection: selectedLevels.length > 0,
        areas
    };
};
