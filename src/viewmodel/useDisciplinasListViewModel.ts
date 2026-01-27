
import { useState, useEffect, useCallback } from 'react';
import { Disciplina, SERIES_FUNDAMENTAL, SERIES_MEDIO } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';
import { useDI } from '../di/useDI';
import { NivelEnsino } from '../model/entities/BNCC';

export const useDisciplinasListViewModel = (areaFilter?: string, serieFilter?: string, nivelFilter?: string) => {
    const {
        getAllDisciplinasUseCase,
        getUserContextUseCase,
        deleteDisciplinaUseCase
    } = useDI();
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadDisciplinas = useCallback(async () => {
        setLoading(true);
        try {
            // First fetch by Area (if provided) or all
            let data = await getAllDisciplinasUseCase.execute(areaFilter);

            // Fetch User Context for Nivel filtering
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const ctx = await getUserContextUseCase.execute(userId);
                if (ctx && ctx.niveis_ensino && ctx.niveis_ensino.length > 0) {
                    // Filter Disciplinas: Only show those matching the user (Ensino Fundamental/Médio)
                    // Note: Disciplina 'nivel' field must match one of the user's selected levels
                    data = data.filter(d => ctx.niveis_ensino.includes(d.nivel as NivelEnsino));
                }
            }

            // Filter by Serie
            if (serieFilter && serieFilter !== 'all') {
                data = data.filter(d => d.serie === serieFilter);
            }

            // Filter by Nivel (Local Filter from Dropdown)
            // This applies ON TOP of the context filter 
            if (nivelFilter && nivelFilter !== 'all') {
                if (nivelFilter === 'Ensino Fundamental') {
                    data = data.filter(d => SERIES_FUNDAMENTAL.some(s => s === d.serie));
                } else if (nivelFilter === 'Ensino Médio') {
                    data = data.filter(d => SERIES_MEDIO.some(s => s === d.serie));
                }
            }

            setDisciplinas(data);
        } catch (error) {
            console.error('Error fetching disciplinas:', error);
        } finally {
            setLoading(false);
        }
    }, [areaFilter, serieFilter, nivelFilter, getAllDisciplinasUseCase, getUserContextUseCase]);

    const deleteDisciplina = async (id: string) => {
        try {
            await deleteDisciplinaUseCase.execute(id);
            setDisciplinas(prev => prev.filter(d => d.id !== id));
            toast({
                title: "Sucesso",
                description: "Disciplina excluída com sucesso.",
            });
        } catch (error) {
            console.error('Error deleting disciplina:', error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir a disciplina.",
                variant: "destructive",
            });
        }
    }

    useEffect(() => {
        loadDisciplinas();
    }, [loadDisciplinas]);

    return {
        disciplinas,
        loading,
        refresh: loadDisciplinas,
        deleteDisciplina
    };
};
