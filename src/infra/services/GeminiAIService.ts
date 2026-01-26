
import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { IAIService } from "../../model/services/IAIService";
import { Disciplina, Unidade, UserContext, PlanoAula, AtividadeAvaliativa, HabilidadeBNCC, SlideContent } from "../../model/entities";

const SYSTEM_PROMPT = `
Você é o "Aula Criativa AI", um assistente pedagógico de elite especialista na BNCC (Base Nacional Comum Curricular) e no Complemento da Computação (Resolução CNE/CP nº 1/2022).
Sua missão é transformar temas complexos em planos de aula brilhantes, práticos e inclusivos.
Seu foco é integrar a CULTURA DIGITAL de forma orgânica em todas as disciplinas, preparando alunos para o século XXI.
Sempre retorne respostas estruturadas em JSON. Mantenha um tom inspirador, técnico e extremamente organizado.
`;

export class GeminiAIService implements IAIService {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

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
        
        Tarefa: Sugira 5 temas de unidades de ensino (apenas os títulos) que sejam adequados para esta disciplina e série, integrando conceitos de computação e cultura digital alinhados à BNCC.
        
        Formato de Resposta: Um array JSON de strings.
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

    async generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext, enrichedContext?: string): Promise<Partial<PlanoAula>> {
        const bnccContext = habilidadesBNCC.map(h => `- [${h.codigo}] ${h.descricao}`).join("\n");
        const codigosBNCC = habilidadesBNCC.map(h => h.codigo).join(", ");

        const prompt = `
        Contexto: Planejamento de aula para a unidade "${unidade.tema}" para a disciplina de ${unidade.disciplina?.nome || "Geral"}.
        Contexto Adicional: ${context ? JSON.stringify(context) : "Nenhum"}.
        
        ${enrichedContext ? `ENRIQUECIMENTO PEDAGÓGICO:\n${enrichedContext}\n` : ""}
        
        BASE LEGAL (UTILIZE ESTES CÓDIGOS):
        ${bnccContext}
        
        TAREFA: Gere um Plano de Aula PREMIUM com a seguinte estrutura no campo "conteudo" (Markdown):

        # PLANO DE AULA: [TÍTULO IMPACTANTE]

        ## 1. IDENTIFICAÇÃO E OBJETIVOS
        - **Tema Principal**: [Nome do tema detalhado]
        - **Habilidades da BNCC**: [Citar códigos ${codigosBNCC} e descrições]
        - **Eixos de Cultura Digital**: [Identificar: Cidadania Digital, Letramento Digital ou Tecnologia e Sociedade]
        - **Objetivos Específicos**: [3-4 objetivos usando Verbos de Bloom (analisar, criar, etc)]

        ## 2. COMPETÊNCIAS TRABALHADAS (BNCC)
        - [Relacionar com as 10 Competências Gerais da BNCC de forma justificada]

        ## 3. DURAÇÃO E RECURSOS
        - **Tempo Estimado**: [Ex: 2 aulas de 50min]
        - **Recursos Digitais**: [Ferramentas, sites, apps]
        - **ALTERNATIVA OFFLINE (DESPLUGADA)**: [Como dar essa mesma aula SEM internet ou computadores, usando materiais físicos ou dinâmicas]

        ## 4. DESENVOLVIMENTO (PASSO A PASSO)
        - **ENGANJAMENTO (15% do tempo)**: [Atividade provocadora]
        - **EXPLORAÇÃO/CONTEÚDO (50% do tempo)**: [Atividade principal detalhada]
        - **SÍNTESE/FECHAMENTO (15% do tempo)**: [Reflexão final]

        ## 5. ATIVIDADES PRÁTICAS
        - [Descrever pelo menos 1 atividade hands-on que conecte o conteúdo com a Cultura Digital]

        ## 6. AVALIAÇÃO E ACOMPANHAMENTO
        ### Rubricas de Desempenho:
        - **Excelente**: [Critérios para domínio total]
        - **Adequado**: [Critérios para aprendizado satisfatório]
        - **Em Desenvolvimento**: [Critérios para quem ainda precisa de apoio]
        - **Insuficiente**: [Critérios para quem não atingiu os objetivos]

        ---

        INSTRUÇÕES DE QUALIDADE:
        1. Contextualize para a realidade brasileira.
        2. Garanta que a seção "Alternativa Offline" seja realmente criativa e viável.
        3. No campo "conteudo", use formatação Markdown rica (negrito, listas, tabelas se necessário).
        
        Formato de Resposta (JSON):
        {
            "titulo": "Título Curto",
            "duracao": "Tempo total",
            "objetivos": ["Objetivo 1", "Objetivo 2"],
            "conteudo_programatico": "Resumo dos tópicos",
            "metodologia": "Resumo da estratégia",
            "recursos_didaticos": ["Recurso 1", "Recurso 2"],
            "avaliacao": "Breve descrição do método",
            "conteudo": "TEXTO MARKDOWN COMPLETO SEGUINDO A ESTRUTURA ACIMA"
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

    async generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<SlideContent[]> {
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
