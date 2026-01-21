
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIService } from "../../model/services/IAIService";
import { Disciplina, Unidade, UserContext, PlanoAula, AtividadeAvaliativa, HabilidadeBNCC } from "../../model/entities";

const SYSTEM_PROMPT = `
Você é um assistente pedagógico especialista na BNCC (Base Nacional Comum Curricular) do Brasil.
Sua missão é auxiliar professores a criar conteúdos educacionais de alta qualidade, precisos e alinhados com as competências e habilidades da BNCC.
Sempre retorne respostas estruturadas em JSON quando solicitado.
Mantenha um tom profissional, encorajador e educativo.
`;

export class GeminiAIService implements IAIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
        if (!apiKey) {
            console.error("VITE_GOOGLE_API_KEY is not set");
        }
        this.genAI = new GoogleGenerativeAI(apiKey || "");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    async suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]> {
        const prompt = `
        Contexto: Professor de ${disciplina.nome} para a série ${disciplina.serie} (${disciplina.nivel}).
        Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
        
        Tarefa: Sugira 5 temas de unidades de ensino (apenas os títulos) que sejam adequados para esta disciplina e série, alinhados à BNCC.
        
        Formato de Resposta: Um array JSON de strings. Exemplo: ["Tema 1", "Tema 2"]
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response;
            const text = response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Error generating units:", error);
            return ["Erro ao gerar sugestões. Tente novamente."];
        }
    }

    async generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<PlanoAula>> {
        const bnccContext = habilidadesBNCC.map(h => `- [${h.codigo}] ${h.descricao}`).join("\n");

        const prompt = `
        Contexto: Planejamento de aula para a unidade "${unidade.tema}" da disciplina de ${unidade.disciplina?.nome || "Não especificada"}.
        Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
        
        UTILIZE as habilidades da BNCC abaixo como referência principal:
        ${bnccContext}
        
        INSTRUÇÕES DE ALINHAMENTO BNCC:
        1. Se houver habilidades na lista que correspondam EXATAMENTE ao tema "${unidade.tema}", use-as.
        2. Se o tema NÃO estiver explicitamente citado nas habilidades, escolha as habilidades da lista que sejam CONCEITUALMENTE MAIS PRÓXIMAS ou que sirvam de suporte para o tema.
        3. JUSTIFIQUE no campo "conteudo" como o tema "${unidade.tema}" se conecta com os códigos BNCC escolhidos.
        4. Se a lista de habilidades fornecida estiver vazia, gere um plano genérico, mas avise explicitamente que nenhuma habilidade BNCC foi encontrada no repositório local.

        
        Tarefa: Crie um plano de aula detalhado seguindo a BNCC, citando os códigos das habilidades trabalhadas.
        
        Formato de Resposta (JSON):
        {
            "titulo": "Título da Aula",
            "duracao": "Estimativa de tempo (ex: 50 minutos)",
            "objetivos": ["Objetivo 1", "Objetivo 2"],
            "conteudo_programatico": "Descrição dos tópicos abordados",
            "metodologia": "Estratégias de ensino",
            "recursos_didaticos": ["Recurso 1", "Recurso 2"],
            "avaliacao": "Método de avaliação",
            "conteudo": "Texto completo do plano de aula em Markdown para leitura do professor. Mencione as habilidades ${habilidadesBNCC.map(h => h.codigo).join(", ")} no texto."
        }
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error("Error generating lesson plan:", error);
            return { titulo: "Erro ao gerar plano de aula" };
        }
    }

    async generateAtividade(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<AtividadeAvaliativa>> {
        const bnccContext = habilidadesBNCC.map(h => `- [${h.codigo}] ${h.descricao}`).join("\n");
        const codigosBNCC = habilidadesBNCC.map(h => h.codigo).join(", ");

        const prompt = `
        Contexto: Atividade avaliativa para a unidade "${unidade.tema}".
        Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
        
        UTILIZE EXCLUSIVAMENTE as habilidades da BNCC abaixo:
        ${bnccContext}
        
        NÃO crie conteúdos fora dessas habilidades de código: ${codigosBNCC}.
        
        Tarefa: Crie uma atividade avaliativa com 3 questões (misturando múltipla escolha e dissertativa), focada nessas habilidades.
        
        Formato de Resposta (JSON):
        {
            "titulo": "Título da Atividade",
            "tipo": "Lista de Exercícios / Prova / Trabalho",
            "instrucoes": "Instruções para o aluno",
            "pontuacao_total": 10,
            "questoes": [
                {
                    "id": "1",
                    "enunciado": "Texto da questão. Deve avaliar a habilidade [CODIGO_BNCC]",
                    "tipo": "multipla_escolha",
                    "alternativas": ["A", "B", "C", "D"],
                    "resposta_correta": "A",
                    "pontuacao": 2
                },
                {
                    "id": "2",
                    "enunciado": "Texto da questão (Citar habilidade avaliada se possível)",
                    "tipo": "dissertativa",
                    "pontuacao": 4
                }
            ]
        }
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response;
            return JSON.parse(response.text());
        } catch (error) {
            console.error("Error generating activity:", error);
            throw error;
            // return { titulo: "Erro ao gerar atividade" };
        }
    }

    async generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<import("../../model/services/IAIService").SlideContent[]> {
        const bnccContext = habilidadesBNCC.map(h => `- [${h.codigo}] ${h.descricao}`).join("\n");
        const codigosBNCC = habilidadesBNCC.map(h => h.codigo).join(", ");

        const prompt = `
        Contexto: Apresentação de slides para uma aula sobre "${unidade.tema}".
        Disciplina: ${unidade.disciplina?.nome || "Geral"}.
        Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
        
        Baseie-se nestas habilidades BNCC:
        ${bnccContext}
        
        Tarefa: Crie o conteúdo para uma apresentação de 5 a 8 slides.
        
        Formato de Resposta (JSON Array de Objetos):
        [
            {
                "titulo": "Título do Slide (ex: Introdução, Conceito X, Conclusão)",
                "conteudo": ["Tópico 1 (curto)", "Tópico 2"],
                "anotacoes": "Sugestão de fala para o professor explicar este slide."
            }
        ]
        
        Garanta que o primeiro slide seja a Capa e o último as Referências/Encerramento.
        Mencione os códigos BNCC (${codigosBNCC}) em algum slide pertinente (ex: Objetivos).
        `;

        try {
            const result = await this.model.generateContent({
                contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            });
            const response = result.response;
            const text = response.text();
            return JSON.parse(text);
        } catch (error) {
            console.error("Error generating slides:", error);
            // Fallback mock in case of failure
            return [
                { titulo: "Erro na geração", conteudo: ["Não foi possível gerar os slides pela IA."], anotacoes: "Tente novamente." }
            ];
        }
    }
}
