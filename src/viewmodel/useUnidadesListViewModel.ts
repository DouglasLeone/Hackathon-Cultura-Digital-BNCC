import { useState, useEffect, useCallback } from 'react';
import { Unidade, Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';
import { useDI } from '../di/useDI';

export const useUnidadesListViewModel = (disciplinaId?: string) => {
    const {
        getUnidadesByDisciplinaUseCase,
        getAllUnidadesUseCase,
        createUnidadeUseCase,
        deleteUnidadeUseCase,
        updateUnidadeUseCase,
        suggestUnidadesUseCase
    } = useDI();

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadUnidades = useCallback(async () => {
        setLoading(true);
        try {
            let data: Unidade[];
            if (disciplinaId) {
                data = await getUnidadesByDisciplinaUseCase.execute(disciplinaId);
            } else {
                data = await getAllUnidadesUseCase.execute();
            }
            setUnidades(data);
        } catch (error) {
            console.error('Error fetching unidades:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as unidades.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [disciplinaId, getUnidadesByDisciplinaUseCase, getAllUnidadesUseCase, toast]);

    const createUnidade = async (data: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>) => {
        try {
            const nova = await createUnidadeUseCase.execute(data);
            setUnidades(prev => [nova, ...prev]);
            toast({
                title: "Sucesso",
                description: "Unidade criada com sucesso.",
            });
            return nova;
        } catch (error) {
            console.error('Error creating unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar a unidade.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const deleteUnidade = async (id: string) => {
        try {
            await deleteUnidadeUseCase.execute(id);
            setUnidades(prev => prev.filter(u => u.id !== id));
            toast({
                title: "Sucesso",
                description: "Unidade removida com sucesso.",
            });
        } catch (error) {
            console.error('Error deleting unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível remover a unidade.",
                variant: "destructive",
            });
        }
    };

    const updateUnidade = async (id: string, unidade: Partial<Unidade>) => {
        try {
            const updated = await updateUnidadeUseCase.execute(id, unidade);
            setUnidades(prev => prev.map(u => u.id === id ? updated : u));
            toast({
                title: "Sucesso",
                description: "Unidade atualizada com sucesso.",
            });
            return updated;
        } catch (error) {
            console.error('Error updating unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar a unidade.",
                variant: "destructive",
            });
            throw error; // Re-throw to handle in UI
        }
    }

    const suggestUnidades = async (disciplina: Disciplina) => {
        try {
            return await suggestUnidadesUseCase.execute(disciplina);
        } catch (error) {
            console.error('Error suggesting unidades:', error);
            toast({
                title: "Erro",
                description: "Não foi possível sugerir unidades.",
                variant: "destructive",
            });
            return [];
        }
    }

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    return {
        unidades,
        loading,
        refresh: loadUnidades,
        deleteUnidade,
        createUnidade,
        updateUnidade,
        suggestUnidades
    };
};
