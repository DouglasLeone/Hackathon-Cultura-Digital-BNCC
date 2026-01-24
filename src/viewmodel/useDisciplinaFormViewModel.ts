
import { useState } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';
import { DisciplinaSchema } from '../model/schemas';

interface UseDisciplinaFormViewModelProps {
    onSuccess?: () => void;
}

export const useDisciplinaFormViewModel = ({ onSuccess }: UseDisciplinaFormViewModelProps = {}) => {
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { toast } = useToast();

    const createDisciplina = async (input: Omit<Disciplina, 'id' | 'created_at' | 'updated_at' | 'nivel'>) => {
        setLoading(true);
        try {
            // Derivar nível da série se possível, para satisfazer o schema e o backend
            let nivel: 'Ensino Fundamental' | 'Ensino Médio' | undefined;

            if (input.serie.includes('Ensino Médio')) {
                nivel = 'Ensino Médio';
            } else if (input.serie.includes('Ensino Fundamental')) {
                nivel = 'Ensino Fundamental';
            }

            if (!nivel) {
                toast({
                    title: "Erro de Validação",
                    description: "Não foi possível identificar o nível de ensino a partir da série selecionada.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            const disciplinaCompleta = {
                ...input,
                nivel
            };

            // Validate input com Zod
            const validationResult = DisciplinaSchema.safeParse(disciplinaCompleta);
            if (!validationResult.success) {
                const firstError = validationResult.error.errors[0];
                toast({
                    title: "Erro de Validação",
                    description: `Campo ${firstError.path}: ${firstError.message}`,
                    variant: "destructive",
                });
                return;
            }

            await DIContainer.createDisciplinaUseCase.execute(disciplinaCompleta);
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
