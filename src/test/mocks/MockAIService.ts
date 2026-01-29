import { IAIService, ActivityGenerationOptions } from '../../model/services/IAIService';
import { Disciplina, Unidade, UserContext, HabilidadeBNCC, SlideContent } from '../../model/entities';

export class MockAIService implements IAIService {
    async suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]> {
        return [
            `Unidade Sugerida 1 para ${disciplina.nome}`,
            `Unidade Sugerida 2 para ${disciplina.nome}`,
            `Unidade Sugerida 3 para ${disciplina.nome}`
        ];
    }

    async generatePlanoAula(
        unidade: Unidade,
        habilidadesBNCC: HabilidadeBNCC[],
        context?: UserContext,
        enrichedContext?: string
    ): Promise<Partial<import('../../model/entities').PlanoAula>> {
        return {
            titulo: `Plano de Aula: ${unidade.tema}`,
            duracao: '50 minutos',
            objetivos: ['Compreender o tema', 'Aplicar conhecimentos', 'Analisar contexto'],
            conteudo_programatico: 'Introdução, Desenvolvimento, Conclusão',
            metodologia: 'Aula expositiva e dialogada',
            recursos_didaticos: ['Quadro', 'Projetor'],
            avaliacao: 'Participação e exercícios',
            conteudo: `Conteúdo gerado via Mock para o tema ${unidade.tema}. ${enrichedContext || ''}`,
        };
    }

    async generateAtividade(
        unidade: Unidade,
        habilidadesBNCC: HabilidadeBNCC[],
        options: ActivityGenerationOptions,
        context?: UserContext
    ): Promise<Partial<import('../../model/entities').AtividadeAvaliativa>> {
        const questoes = [];

        // Generate objective questions
        for (let i = 0; i < options.objectiveCount; i++) {
            questoes.push({
                id: `q-obj-${i}`,
                enunciado: `Questão Objetiva ${i + 1} sobre ${unidade.tema}`,
                tipo: 'multipla_escolha' as const,
                alternativas: ['A', 'B', 'C', 'D'],
                resposta_correta: 'A',
                pontuacao: 1
            });
        }

        // Generate subjective questions
        for (let i = 0; i < options.subjectiveCount; i++) {
            questoes.push({
                id: `q-subj-${i}`,
                enunciado: `Questão Dissertativa ${i + 1} sobre ${unidade.tema}`,
                tipo: 'dissertativa' as const,
                pontuacao: 2
            });
        }

        return {
            titulo: `Atividade: ${unidade.tema}`,
            tipo: 'Mista',
            instrucoes: 'Responda com atenção',
            questoes: questoes,
            pontuacao_total: 10,
            criterios_avaliacao: 'Coerência e clareza'
        };
    }

    async generateSlides(
        unidade: Unidade,
        habilidadesBNCC: HabilidadeBNCC[],
        context?: UserContext
    ): Promise<SlideContent[]> {
        return [
            {
                titulo: `Título: ${unidade.tema}`,
                conteudo: ['Introdução ao tema', 'Tópicos principais'],
                anotacoes: 'Apresentar com entusiasmo'
            },
            {
                titulo: 'Desenvolvimento',
                conteudo: ['Conceito chave 1', 'Exemplos práticos'],
                anotacoes: 'Pedir exemplos aos alunos'
            },
            {
                titulo: 'Conclusão',
                conteudo: ['Resumo', 'Próximos passos'],
                anotacoes: 'Encerrar a aula'
            }
        ];
    }
}
