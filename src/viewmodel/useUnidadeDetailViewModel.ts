import { useState, useEffect, useCallback } from 'react';
import { Unidade, SlideContent } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';
import { useUserId } from '../hooks/useUserId';
import { useDI } from '../di/useDI';


export const useUnidadeDetailViewModel = (unidadeId: string) => {
    const {
        getUnidadeByIdUseCase,
        generatePlanoAulaUseCase,
        generateAtividadeUseCase,
        generateSlidesUseCase,
        logMaterialGenerationUseCase,
        updatePlanoAulaUseCase,
        updateAtividadeUseCase,
        updateSlidesUseCase
    } = useDI();

    const [unidade, setUnidade] = useState<Unidade | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null); // 'plano', 'atividade', 'slides'
    const [slides, setSlides] = useState<SlideContent[] | null>(null);
    const { toast } = useToast();
    const userId = useUserId();

    const loadUnidade = useCallback(async () => {
        if (!unidadeId) return;
        setLoading(true);
        try {
            const data = await getUnidadeByIdUseCase.execute(unidadeId);
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
    }, [unidadeId, toast, getUnidadeByIdUseCase]);

    const generatePlanoAula = async () => {
        if (!unidade) return;
        setGenerating('plano');
        try {
            const result = await generatePlanoAulaUseCase.execute(unidade, userId);

            await logMaterialGenerationUseCase.execute({
                tipo: 'plano_aula',
                titulo: `Plano de Aula: ${unidade.tema}`,
                descricao: `Plano de aula gerado para a unidade ${unidade.tema}`,
                disciplina_id: unidade.disciplina_id,
                unidade_id: unidade.id,
                referencia_id: result.id
            });

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

    const generateAtividade = async (options?: import('../model/services/IAIService').ActivityGenerationOptions) => {
        if (!unidade) return;
        setGenerating('atividade');
        try {
            const result = await generateAtividadeUseCase.execute(unidade, userId, options);

            await logMaterialGenerationUseCase.execute({
                tipo: 'atividade',
                titulo: `Atividade: ${unidade.tema}`,
                descricao: `Atividade avaliativa gerada para a unidade ${unidade.tema}`,
                disciplina_id: unidade.disciplina_id,
                unidade_id: unidade.id,
                referencia_id: result.id
            });

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
            const result = await generateSlidesUseCase.execute(unidade);

            // Result is now MaterialSlides entity
            setUnidade(prev => prev ? { ...prev, material_slides: result } : null);
            setSlides(result.conteudo);

            await logMaterialGenerationUseCase.execute({
                tipo: 'slides',
                titulo: `Slides: ${unidade.tema}`,
                descricao: `Slides gerados para a unidade ${unidade.tema}`,
                disciplina_id: unidade.disciplina_id,
                unidade_id: unidade.id,
                referencia_id: result.id
            });

            toast({
                title: "Sucesso",
                description: "Slides gerados com sucesso.",
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
    };

    // New Archive methods
    const archivePlanoAula = async () => {
        if (!unidade || !unidade.plano_aula) return;
        try {
            await updatePlanoAulaUseCase.execute(unidade.plano_aula.id, { arquivado: true });
            setUnidade(prev => prev ? { ...prev, plano_aula: undefined } : null);
            toast({
                title: "Arquivado",
                description: "Plano de aula arquivado com sucesso.",
            });
        } catch (error) {
            console.error('Error archiving plano:', error);
            toast({
                title: "Erro",
                description: "Não foi possível arquivar o plano de aula.",
                variant: "destructive",
            });
        }
    };

    const archiveAtividade = async () => {
        if (!unidade || !unidade.atividade_avaliativa) return;
        try {
            await updateAtividadeUseCase.execute(unidade.atividade_avaliativa.id, { arquivado: true });
            setUnidade(prev => prev ? { ...prev, atividade_avaliativa: undefined } : null);
            toast({
                title: "Arquivado",
                description: "Atividade arquivada com sucesso.",
            });
        } catch (error) {
            console.error('Error archiving atividade:', error);
            toast({
                title: "Erro",
                description: "Não foi possível arquivar a atividade.",
                variant: "destructive",
            });
        }
    };

    const archiveSlides = async () => {
        if (!unidade || !unidade.material_slides) return;
        try {
            await updateSlidesUseCase.execute(unidade.material_slides.id, { arquivado: true });
            setUnidade(prev => prev ? { ...prev, material_slides: undefined } : null);
            setSlides(null);
            toast({
                title: "Arquivado",
                description: "Slides arquivados com sucesso.",
            });
        } catch (error) {
            console.error('Error archiving slides:', error);
            toast({
                title: "Erro",
                description: "Não foi possível arquivar os slides.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        loadUnidade();
    }, [loadUnidade]);

    useEffect(() => {
        if (unidade?.material_slides) {
            setSlides(unidade.material_slides.conteudo);
        } else {
            setSlides(null);
        }
    }, [unidade]);

    const updatePlanoAula = async (conteudo: string) => {
        if (!unidade || !unidade.plano_aula) return;
        try {
            await updatePlanoAulaUseCase.execute(unidade.plano_aula.id, { conteudo });
            // Update local state is optional if we assume react-query or subsequent fetch, 
            // but for instant feedback let's update local state
            setUnidade(prev => prev && prev.plano_aula ? {
                ...prev,
                plano_aula: { ...prev.plano_aula, conteudo }
            } : prev);
        } catch (error) {
            console.error('Error updating plano:', error);
            toast({
                title: "Erro",
                description: "Não foi possível salvar o plano.",
                variant: "destructive",
            });
            throw error;
        }
    };

    const updateAtividade = async (conteudo: string) => {
        if (!unidade || !unidade.atividade_avaliativa) return;
        try {
            // Check if it's HTML (from rich editor) or JSON
            if (conteudo.trim().startsWith('<')) {
                await updateAtividadeUseCase.execute(unidade.atividade_avaliativa.id, { conteudo });
                setUnidade(prev => prev && prev.atividade_avaliativa ? {
                    ...prev,
                    atividade_avaliativa: { ...prev.atividade_avaliativa, conteudo }
                } : prev);
            } else {
                // Try JSON for backward compatibility or structured editing
                try {
                    const parsed = JSON.parse(conteudo);
                    await updateAtividadeUseCase.execute(unidade.atividade_avaliativa.id, { questoes: parsed });
                    setUnidade(prev => prev && prev.atividade_avaliativa ? {
                        ...prev,
                        atividade_avaliativa: { ...prev.atividade_avaliativa, questoes: parsed }
                    } : prev);
                } catch (e) {
                    // If not JSON and not HTML, maybe it's just text
                    await updateAtividadeUseCase.execute(unidade.atividade_avaliativa.id, { conteudo });
                    setUnidade(prev => prev && prev.atividade_avaliativa ? {
                        ...prev,
                        atividade_avaliativa: { ...prev.atividade_avaliativa, conteudo }
                    } : prev);
                }
            }
        } catch (error) {
            console.error('Error updating atividade:', error);
            throw error;
        }
    };

    return {
        unidade,
        loading,
        generating,
        generatePlanoAula,
        generateAtividade,
        generateSlides,
        refresh: loadUnidade,
        archivePlanoAula,
        archiveAtividade,
        archiveSlides,
        slides,
        updatePlanoAula,
        updateAtividade
    };
};
