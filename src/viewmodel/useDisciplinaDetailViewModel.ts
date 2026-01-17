
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina } from '../model/entities';

export const useDisciplinaDetailViewModel = (id: string) => {
    const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await DIContainer.getDisciplinaByIdUseCase.execute(id);
                setDisciplina(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    return { disciplina, loading };
}
