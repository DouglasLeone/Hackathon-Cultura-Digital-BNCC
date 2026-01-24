
import { useState, useEffect, useCallback } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina, SERIES_FUNDAMENTAL, SERIES_MEDIO } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useDisciplinasListViewModel = (areaFilter?: string, serieFilter?: string, nivelFilter?: string) => {
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadDisciplinas = useCallback(async () => {
        setLoading(true);
        try {
            // First fetch by Area (if provided) or all
            let data = await DIContainer.getAllDisciplinasUseCase.execute(areaFilter);

            // Fetch User Context for Nivel filtering
            const userId = localStorage.getItem('user_id');
            if (userId) {
                const ctx = await DIContainer.getUserContextUseCase.execute(userId);
                if (ctx && ctx.niveis_ensino && ctx.niveis_ensino.length > 0) {
                    // Filter Disciplinas: Only show those matching the user (Ensino Fundamental/Médio)
                    // Note: Disciplina 'nivel' field must match one of the user's selected levels
                    data = data.filter(d => ctx.niveis_ensino.includes(d.nivel as any));
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
    }, [toast, areaFilter, serieFilter, nivelFilter]);

    const deleteDisciplina = async (id: string) => {
        try {
            await DIContainer.deleteDisciplinaUseCase.execute(id);
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
