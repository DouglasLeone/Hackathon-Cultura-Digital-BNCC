
import { useState, useEffect } from 'react';
import { DIContainer } from '../di/container';
import { Disciplina, Unidade } from '../model/entities';
import { useToast } from '../view/components/ui/use-toast';

export const useGerarMaterialViewModel = () => {
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load initial data
    useEffect(() => {
        const loadToData = async () => {
            setLoading(true);
            try {
                const [disciplinasData, unidadesData] = await Promise.all([
                    DIContainer.getAllDisciplinasUseCase.execute(),
                    DIContainer.getAllUnidadesUseCase.execute()
                ]);
                setDisciplinas(disciplinasData);
                setUnidades(unidadesData);
            } catch (error) {
                console.error('Error loading data:', error);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar os dados iniciais.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };
        loadToData();
    }, []);

    const gerarPlanoAula = async (unidadeId: string, instrucoes?: string) => {
        setLoading(true);
        try {
            const unidade = unidades.find(u => u.id === unidadeId);
            if (!unidade) throw new Error("Unidade não encontrada");

            // 1. Generate Plan
            const plano = await DIContainer.generatePlanoAulaUseCase.execute(unidade);

            // 2. Log History
            await DIContainer.logMaterialGenerationUseCase.execute({
                tipo: 'plano_aula',
                titulo: `Plano de Aula: ${unidade.tema}`,
                descricao: `Plano de aula gerado para a unidade ${unidade.tema}`,
                disciplina_id: unidade.disciplina_id,
                unidade_id: unidade.id,
                referencia_id: plano.id
            });

            toast({
                title: "Sucesso",
                description: "Plano de aula gerado e salvo na unidade.",
            });
            return plano;
        } catch (error) {
            console.error('Error generating plano:', error);
            toast({
                title: "Erro",
                description: "Falha ao gerar plano de aula.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const gerarAtividade = async (unidadeId: string, instrucoes?: string) => {
        setLoading(true);
        try {
            const unidade = unidades.find(u => u.id === unidadeId);
            if (!unidade) throw new Error("Unidade não encontrada");

            // 1. Generate Activity
            const atividade = await DIContainer.generateAtividadeUseCase.execute(unidade);

            // 2. Log History
            await DIContainer.logMaterialGenerationUseCase.execute({
                tipo: 'atividade',
                titulo: `Atividade: ${unidade.tema}`,
                descricao: `Atividade avaliativa gerada para a unidade ${unidade.tema}`,
                disciplina_id: unidade.disciplina_id,
                unidade_id: unidade.id,
                referencia_id: atividade.id
            });

            toast({
                title: "Sucesso",
                description: "Atividade gerada e salva na unidade.",
            });
            return atividade;
        } catch (error) {
            console.error('Error generating atividade:', error);
            toast({
                title: "Erro",
                description: "Falha ao gerar atividade.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const sugerirUnidade = async (disciplinaId: string, instrucoes?: string) => {
        setLoading(true);
        try {
            const disciplina = disciplinas.find(d => d.id === disciplinaId);
            if (!disciplina) throw new Error("Disciplina não encontrada");

            const suggestions = await DIContainer.suggestUnidadesUseCase.execute(disciplina);

            // Note: Suggestions are just strings, not entities saved yet. 
            // We might not log history for suggestions unless saved? 
            // Let's log it anyway as interaction.
            await DIContainer.logMaterialGenerationUseCase.execute({
                tipo: 'sugestao_unidade',
                titulo: `Sugestão de Unidades`,
                descricao: `Sugestões de unidades para a disciplina ${disciplina.nome}`,
                disciplina_id: disciplina.id
            });

            toast({
                title: "Sucesso",
                description: "Sugestões geradas com sucesso.",
            });
            return suggestions;
        } catch (error) {
            console.error('Error suggesting unidades:', error);
            toast({
                title: "Erro",
                description: "Falha ao sugerir unidades.",
                variant: "destructive"
            });
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return {
        disciplinas,
        unidades,
        loading,
        gerarPlanoAula,
        gerarAtividade,
        sugerirUnidade
    };
};
