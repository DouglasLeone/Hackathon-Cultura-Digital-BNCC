
import { IAIService } from '../../model/services/IAIService';
import { Disciplina, Unidade } from '../../model/entities';

export class MockAIService implements IAIService {
    async suggestUnidades(disciplina: Disciplina): Promise<string[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const suggestions = [
            `Introdução a ${disciplina.nome}`,
            `Fundamentos de ${disciplina.nome} no cotidiano`,
            `${disciplina.nome} e a Cultura Digital`,
            `Aplicações práticas de ${disciplina.nome}`,
            `Projeto Integrador: ${disciplina.nome} e Sociedade`
        ];

        return suggestions;
    }

    async generatePlanoAula(unidade: Unidade): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            titulo: `Plano de Aula: ${unidade.tema}`,
            duracao: "50 minutos",
            objetivos: ["Compreender conceitos básicos", "Aplicar conhecimento em situações reais"],
            conteudo_programatico: "Introdução, Desenvolvimento, Prática, Encerramento",
            metodologia: "Aula expositiva dialogada e atividades em grupo",
            recursos_didacticos: ["Quadro branco", "Projetor", "Tablets"],
            avaliacao: "Participação em aula e exercícios práticos"
        };
    }

    async generateAtividade(unidade: Unidade): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            titulo: `Atividade: ${unidade.tema}`,
            tipo: "Lista de Exercícios",
            instrucoes: "Responda as questões abaixo com base no conteúdo da aula.",
            questoes: [
                {
                    id: "1",
                    enunciado: "Qual o principal conceito abordado na aula?",
                    tipo: "dissertativa",
                    pontuacao: 2.5
                },
                {
                    id: "2",
                    enunciado: "Selecione a alternativa correta sobre o tema.",
                    tipo: "multipla_escolha",
                    alternativas: ["Opção A", "Opção B", "Opção C", "Opção D"],
                    resposta_correta: "Opção A",
                    pontuacao: 2.5
                }
            ],
            pontuacao_total: 5.0
        };
    }

    async generateSlides(unidade: Unidade): Promise<any> {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            titulo: `Slides: ${unidade.tema}`,
            slides_count: 5,
            url: "#", // Mock url
            message: "Slides gerados com sucesso (simulação)"
        };
    }
}
