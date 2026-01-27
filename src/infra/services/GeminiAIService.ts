
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

    private cleanAndParseJSON(text: string): any {
        try {
            // First pass: direct cleanup
            const directCleaned = text.replace(/```json\n?|```/g, "").trim();
            try {
                return JSON.parse(directCleaned);
            } catch (innerError) {
                // Second pass: try to find the first '{' and last '}'
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const extracted = text.substring(firstBrace, lastBrace + 1);
                    return JSON.parse(extracted);
                }

                // Third pass: Try Reparation for Truncated JSON
                // If it seems we have a valid start but invalid end, try to close it
                if (firstBrace !== -1) {
                    const fromStart = text.substring(firstBrace);
                    const repaired = this.tryRepairJSON(fromStart);
                    if (repaired) return JSON.parse(repaired);
                }

                throw innerError;
            }
        } catch (e) {
            console.error("Failed to parse AI JSON. Length:", text.length);
            console.error("Partial text:", text.substring(0, 500) + "...");
            throw new Error(`Erro de processamento da IA: A resposta gerada não é um JSON válido. Detalhes: ${e instanceof Error ? e.message : 'Desconhecido'}`);
        }
    }

    private tryRepairJSON(jsonStr: string): string | null {
        try {
            // Simple robust stack-based closer
            let stack = [];
            let inString = false;
            let escape = false;

            // Only process until the very end of validity? No, we just append missing closure.
            // But we need to know WHAT is missing.
            // Simplified approach: Count nesting levels.

            // Actually, a lot of library solutions involve complex parsing.
            // Let's try a heuristic: if it ends with "...", remove the "..."
            if (jsonStr.endsWith("...")) {
                jsonStr = jsonStr.substring(0, jsonStr.length - 3);
            }

            // If it ends inside a string (odd number of quotes?), close the string
            // This is hard to do perfectly without a parser.
            // Let's rely on a primitive closure strategy:
            // 1. Close any open string (roughly)
            // 2. Close any open objects/arrays

            // Count balances
            let openBraces = 0;
            let openBrackets = 0;
            let inQuote = false;

            for (let i = 0; i < jsonStr.length; i++) {
                const char = jsonStr[i];
                if (inQuote) {
                    if (char === '\\') { i++; continue; } // skip escaped
                    if (char === '"') inQuote = false;
                } else {
                    if (char === '"') inQuote = true;
                    else if (char === '{') openBraces++;
                    else if (char === '}') openBraces--;
                    else if (char === '[') openBrackets++;
                    else if (char === ']') openBrackets--;
                }
            }

            let repaired = jsonStr;
            if (inQuote) repaired += '"'; // Close string

            // Close arrays and objects in correct order? 
            // We just counted balance. This assumes simple nesting.
            // A properly truncated JSON usually needs Closing in reverse order.
            // We can't know the order from just counters easily.
            // Let's try to just append enough '}' and ']' to satisfy the count?
            // This works if hierarchy is simple or correct.
            // But if we have { [ }, we need ] }. 

            // Improved strategy: Maintain a stack of expected closers
            const closerStack = [];
            let inQ = false;
            let i = 0;
            while (i < jsonStr.length) {
                const c = jsonStr[i];
                if (c === '\\' && inQ) { i += 2; continue; }
                if (c === '"') { inQ = !inQ; }
                if (!inQ) {
                    if (c === '{') closerStack.push('}');
                    if (c === '[') closerStack.push(']');
                    if (c === '}' || c === ']') {
                        // Pop the last matching
                        // Note: this assumes valid JSON structure up to that point
                        if (closerStack.length > 0) {
                            const last = closerStack[closerStack.length - 1];
                            if (c === last) closerStack.pop();
                        }
                    }
                }
                i++;
            }

            if (inQ) repaired += '"';
            while (closerStack.length > 0) {
                repaired += closerStack.pop();
            }

            return repaired;

        } catch (e) {
            return null;
        }
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
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096,
                    temperature: 0.7
                }
            });
            return this.cleanAndParseJSON(result.response.text());
        } catch (error) {
            console.error("Error generating units:", error);
            return ["Erro ao gerar sugestões. Tente novamente."];
        }
    }

    async generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext, enrichedContext?: string): Promise<Partial<PlanoAula>> {
        const bnccContext = habilidadesBNCC.map(h => `- [${h.codigo}] ${h.descricao}`).join("\n");
        const codigosBNCC = habilidadesBNCC.map(h => h.codigo).join(", ");

        const baseContext = `
        Contexto: Planejamento de aula para a unidade "${unidade.tema}" para a disciplina de ${unidade.disciplina?.nome || "Geral"}.
        Contexto Adicional: ${context ? JSON.stringify(context) : "Nenhum"}.
        ${enrichedContext ? `ENRIQUECIMENTO PEDAGÓGICO:\n${enrichedContext}\n` : ""}
        BASE LEGAL (CÓDIGOS BNCC):
        ${bnccContext}
        `;

        // Passo 1: Gerar Metadados (JSON leve)
        const metadataPrompt = `
        ${baseContext}
        
        TAREFA: Gere APENAS a estrutura de metadados do Plano de Aula.
        
        Formato de Resposta (JSON):
        {
            "titulo": "Título Curto",
            "duracao": "Tempo total",
            "objetivos": ["Objetivo 1", "Objetivo 2"],
            "conteudo_programatico": "Resumo dos tópicos",
            "metodologia": "Resumo da estratégia",
            "recursos_didaticos": ["Recurso 1", "Recurso 2"],
            "avaliacao": "Breve descrição do método"
        }
        `;

        // Passo 2: Gerar Conteúdo Detalhado (Markdown puro)
        const contentPrompt = `
        ${baseContext}
        
        TAREFA: Gere o CONTEÚDO DETALHADO do Plano de Aula em formato MARKDOWN.
        NÃO retorne JSON. Retorne apenas o texto Markdown.
        
        ESTRUTURA OBRIGATÓRIA (Use Markdown):
        # [TÍTULO]

        > **Visão Geral**: [Breve frase de impacto sobre a aula]

        ## 1. Identificação e Objetivos
        > **Tema Principal**: [Tema]
        > **Habilidades BNCC**: [Citar códigos ${codigosBNCC}]
        > **Eixos**: [Cultura Digital / Letramento / Tecnologia]

        **Objetivos de Aprendizagem**:
        - [Objetivo 1]
        - [Objetivo 2]
        - [Objetivo 3]

        ## 2. Preparação
        > **Tempo Necessário**: [Duração]
        > **Recursos**: [Listar recursos físicos e digitais]
        
        **Alternativa Offline**:
        - [Como adaptar sem internet]

        ## 3. Desenvolvimento (Passo a Passo)
        ### 1. Engajamento (15%)
        [Como iniciar a aula, perguntas disparadoras]

        ### 2. Exploração (50%)
        [Conteúdo principal, explicação, exemplos]

        > **Dica para o Professor**: [Sugestão pedagógica ou curiosidade]

        ### 3. Síntese (15%)
        [Como fechar a aula e verificar aprendizado]

        ## 4. Atividade Prática
        **Tarefa**: [Descrição da atividade]
        
        ## 5. Avaliação
        - [Critérios de avaliação]
        `;

        try {
            // Executar em paralelo para ganhar tempo? Não, melhor sequencial para garantir contexto se necessário, 
            // mas aqui são independentes. Vamos fazer paralelo para performance.
            const [metadataResult, contentResult] = await Promise.all([
                this.model.generateContent({
                    contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + metadataPrompt }] }],
                    generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
                }),
                this.model.generateContent({
                    contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + contentPrompt }] }],
                    generationConfig: { responseMimeType: "text/plain", maxOutputTokens: 8192, temperature: 0.7 }
                })
            ]);

            const metadata = this.cleanAndParseJSON(metadataResult.response.text());
            const content = contentResult.response.text();

            return {
                ...metadata,
                conteudo: content
            };

        } catch (error) {
            console.error("Error generating lesson plan:", error);
            return {
                titulo: "Erro ao gerar plano de aula",
                conteudo: "Ocorreu um erro ao processar a resposta da IA. Por favor, tente novamente.\n\nDetalhes do erro: " + (error instanceof Error ? error.message : String(error))
            };
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
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096,
                    temperature: 0.7
                }
            });
            return this.cleanAndParseJSON(result.response.text());
        } catch (error) {
            console.error("Error generating activity:", error);
            throw error;
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
                generationConfig: {
                    responseMimeType: "application/json",
                    maxOutputTokens: 4096,
                    temperature: 0.7
                }
            });
            return this.cleanAndParseJSON(result.response.text());
        } catch (error) {
            console.error("Error generating slides:", error);
            return [
                { titulo: "Erro na geração", conteudo: ["Não foi possível gerar os slides pela IA."], anotacoes: "Tente novamente." }
            ];
        }
    }
}
