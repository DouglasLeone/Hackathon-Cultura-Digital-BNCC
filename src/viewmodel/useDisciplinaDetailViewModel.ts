
import { useState, useEffect } from 'react';
import { Disciplina } from '../model/entities';
import { useDI } from '../di/useDI';

export const useDisciplinaDetailViewModel = (disciplinaId?: string) => {
    const { getDisciplinaByIdUseCase } = useDI();
    const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!disciplinaId) return;
            try {
                const data = await getDisciplinaByIdUseCase.execute(disciplinaId);
                setDisciplina(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [disciplinaId, getDisciplinaByIdUseCase]);

    return { disciplina, loading };
}
