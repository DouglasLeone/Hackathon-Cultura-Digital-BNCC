
import { useState, useEffect, useCallback } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useDisciplinasListViewModel = (areaFilter?: string) => {
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadDisciplinas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await DIContainer.getAllDisciplinasUseCase.execute(areaFilter);
            setDisciplinas(data);
        } catch (error) {
            console.error('Error fetching disciplinas:', error);
            // Suppressing error toast as requested for empty states or minor issues
            // toast({
            //     title: "Erro",
            //     description: "Não foi possível carregar as disciplinas.",
            //     variant: "destructive",
            // });
        } finally {
            setLoading(false);
        }
    }, [toast, areaFilter]);

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
