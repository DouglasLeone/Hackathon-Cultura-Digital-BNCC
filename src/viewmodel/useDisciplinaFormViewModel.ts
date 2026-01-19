
import { useState } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

interface UseDisciplinaFormViewModelProps {
    onSuccess?: () => void;
}

export const useDisciplinaFormViewModel = ({ onSuccess }: UseDisciplinaFormViewModelProps = {}) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { toast } = useToast();

    const createDisciplina = async (disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at' | 'nivel'>) => {
        setLoading(true);
        try {
            await DIContainer.createDisciplinaUseCase.execute(disciplina);
            toast({
                title: "Sucesso",
                description: "Disciplina criada com sucesso.",
            });
            onSuccess?.();
        } catch (error) {
            console.error('Error creating disciplina:', error);
            toast({
                title: "Erro",
                description: "Não foi possível criar a disciplina.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateDisciplina = async (id: string, disciplina: Partial<Disciplina>) => {
        setLoading(true);
        try {
            await DIContainer.updateDisciplinaUseCase.execute(id, disciplina);
            toast({
                title: "Sucesso",
                description: "Disciplina atualizada com sucesso.",
            });
            onSuccess?.();
        } catch (error) {
            console.error('Error updating disciplina:', error);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar a disciplina.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getSuggestions = async (disciplina: Disciplina) => {
        // Stub implementation for now as the entity might not be fully formed or we just want suggestions based on what we have
        try {
            const result = await DIContainer.suggestUnidadesUseCase.execute(disciplina);
            setSuggestions(result);
        } catch (error) {
            console.error("Error getting suggestions", error);
        }
    }

    return {
        createDisciplina,
        updateDisciplina,
        getSuggestions,
        suggestions,
        loading
    };
};
