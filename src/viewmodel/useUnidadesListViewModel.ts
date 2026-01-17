
import { useState, useEffect, useCallback } from 'react';
import { DIContainer } from '../di/container';
import { Unidade, Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useUnidadesListViewModel = (disciplinaId?: string) => {
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const loadUnidades = useCallback(async () => {
        setLoading(true);
        try {
            let data: Unidade[];
            if (disciplinaId) {
                data = await DIContainer.getUnidadesByDisciplinaUseCase.execute(disciplinaId);
            } else {
                data = await DIContainer.getAllUnidadesUseCase.execute();
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
    }, [disciplinaId, toast]);

    const deleteUnidade = async (id: string) => {
        try {
            await DIContainer.deleteUnidadeUseCase.execute(id);
            setUnidades(prev => prev.filter(u => u.id !== id));
            toast({
                title: "Sucesso",
                description: "Unidade excluída com sucesso.",
            });
        } catch (error) {
            console.error('Error deleting unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível excluir a unidade.",
                variant: "destructive",
            });
        }
    };

    // New create method
    const createUnidade = async (unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>) => {
        try {
            await DIContainer.createUnidadeUseCase.execute(unidade);
            toast({
                title: "Sucesso",
                description: "Unidade criada com sucesso.",
            });
            loadUnidades(); // Refresh list
        } catch (error) {
            console.error('Error creating unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar a unidade.",
                variant: "destructive",
            });
            throw error; // Re-throw to handle in UI
        }
    }

    const updateUnidade = async (id: string, unidade: Partial<Unidade>) => {
        try {
            await DIContainer.updateUnidadeUseCase.execute(id, unidade);
            toast({
                title: "Sucesso",
                description: "Unidade atualizada com sucesso.",
            });
            loadUnidades(); // Refresh list
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
            return await DIContainer.suggestUnidadesUseCase.execute(disciplina);
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
