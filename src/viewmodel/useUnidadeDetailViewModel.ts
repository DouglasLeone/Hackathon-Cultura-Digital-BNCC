
import { useState, useEffect, useCallback } from 'react';
import { DIContainer } from '../di/container';
import { Unidade, PlanoAula, AtividadeAvaliativa } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useUnidadeDetailViewModel = (unidadeId: string) => {
    const [unidade, setUnidade] = useState<Unidade | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null); // 'plano', 'atividade', 'slides'
    const { toast } = useToast();

    const loadUnidade = useCallback(async () => {
        if (!unidadeId) return;
        setLoading(true);
        try {
            const data = await DIContainer.getUnidadeByIdUseCase.execute(unidadeId);
            setUnidade(data);
        } catch (error) {
            console.error('Error fetching unidade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar a unidade.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [unidadeId, toast]);

    const generatePlanoAula = async () => {
        if (!unidade) return;
        setGenerating('plano');
        try {
            const result = await DIContainer.generatePlanoAulaUseCase.execute(unidade);
            setUnidade(prev => prev ? { ...prev, plano_aula: result } : null);
            toast({
                title: "Sucesso",
                description: "Plano de aula gerado com sucesso.",
            });
        } catch (error) {
            console.error('Error generating plano:', error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar o plano de aula.",
                variant: "destructive",
            });
        } finally {
            setGenerating(null);
        }
    };

    const generateAtividade = async () => {
        if (!unidade) return;
        setGenerating('atividade');
        try {
            const result = await DIContainer.generateAtividadeUseCase.execute(unidade);
            setUnidade(prev => prev ? { ...prev, atividade_avaliativa: result } : null);
            toast({
                title: "Sucesso",
                description: "Atividade avaliativa gerada com sucesso.",
            });
        } catch (error) {
            console.error('Error generating atividade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar a atividade.",
                variant: "destructive",
            });
        } finally {
            setGenerating(null);
        }
    };

    const generateSlides = async () => {
        if (!unidade) return;
        setGenerating('slides');
        try {
            await DIContainer.generateSlidesUseCase.execute(unidade);
            toast({
                title: "Sucesso",
                description: "Slides gerados com sucesso (simulação).",
            });
        } catch (error) {
            console.error('Error generating slides:', error);
            toast({
                title: "Erro",
                description: "Não foi possível gerar os slides.",
                variant: "destructive",
            });
        } finally {
            setGenerating(null);
        }
    }

    useEffect(() => {
        loadUnidade();
    }, [loadUnidade]);

    return {
        unidade,
        loading,
        generating,
        generatePlanoAula,
        generateAtividade,
        generateSlides,
        refresh: loadUnidade
    };
};
