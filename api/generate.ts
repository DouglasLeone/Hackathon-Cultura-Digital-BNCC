import { GoogleGenerativeAI } from "@google/generative-ai";

// Cache for simple rate limiting (Note: In serverless, this only persists in warm containers)
// For production robust rate limiting, use Vercel KV or Edge Middleware
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_PAYLOAD_SIZE = 40 * 1024; // 40KB

const ALLOWED_ACTIONS = [
    'suggestUnidades',
    'generatePlanoAula',
    'generateAtividade',
    'generateSlides'
] as const;

type AllowedAction = typeof ALLOWED_ACTIONS[number];

const SYSTEM_PROMPT = `
Você é o "Aula Criativa AI", um assistente pedagógico de elite especialista na BNCC (Base Nacional Comum Curricular) e no Complemento da Computação (Resolução CNE/CP nº 1/2022).
Sua missão é transformar temas complexos em planos de aula brilhantes, práticos e inclusivos.
Seu foco é integrar a CULTURA DIGITAL de forma orgânica em todas as disciplinas, preparando alunos para o século XXI.
Sempre retorne respostas estruturadas em JSON. Mantenha um tom inspirador, técnico e extremamente organizado.
`;

function isAllowedAction(action: any): action is AllowedAction {
    return ALLOWED_ACTIONS.includes(action);
}

function cleanAndParseJSON(text: string): any {
    try {
        const directCleaned = text.replace(/```json\n?|```/g, "").trim();
        try {
            return JSON.parse(directCleaned);
        } catch (innerError) {
            const firstBrace = text.search(/[{[]/);
            const lastBraceCheck = text.lastIndexOf('}');
            const lastBracketCheck = text.lastIndexOf(']');
            const lastBrace = Math.max(lastBraceCheck, lastBracketCheck);

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const extracted = text.substring(firstBrace, lastBrace + 1);
                return JSON.parse(extracted);
            }
            if (firstBrace !== -1) {
                const fromStart = text.substring(firstBrace);
                const repaired = tryRepairJSON(fromStart);
                if (repaired) return JSON.parse(repaired);
            }
            throw innerError;
        }
    } catch (e) {
        throw new Error(`A IA teve um pequeno soluço ao organizar os dados. Por favor, tente gerar novamente.`);
    }
}

function tryRepairJSON(jsonStr: string): string | null {
    try {
        if (jsonStr.endsWith("...")) {
            jsonStr = jsonStr.substring(0, jsonStr.length - 3);
        }

        let inQ = false;
        const closerStack = [];
        let i = 0;

        while (i < jsonStr.length) {
            const c = jsonStr[i];
            if (c === '\\' && inQ) { i += 2; continue; }
            if (c === '"') { inQ = !inQ; }
            if (!inQ) {
                if (c === '{') closerStack.push('}');
                if (c === '[') closerStack.push(']');
                if (c === '}' || c === ']') {
                    if (closerStack.length > 0) {
                        const last = closerStack[closerStack.length - 1];
                        if (c === last) closerStack.pop();
                    }
                }
            }
            i++;
        }

        let repaired = jsonStr;
        if (inQ) repaired += '"';
        while (closerStack.length > 0) {
            repaired += closerStack.pop();
        }

        return repaired;
    } catch (e) {
        return null;
    }
}

export default async function handler(req: any, res: any) {
    // 1. Validar Método
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 2. Simple Rate Limiting (IP base)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const rateData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    if (now - rateData.lastReset > RATE_LIMIT_WINDOW) {
        rateData.count = 0;
        rateData.lastReset = now;
    }

    if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
        res.setHeader('Retry-After', Math.ceil((RATE_LIMIT_WINDOW - (now - rateData.lastReset)) / 1000));
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    rateData.count++;
    rateLimitMap.set(ip, rateData);

    // 3. Validar Tamanho do Payload
    const payloadSize = JSON.stringify(req.body).length;
    if (payloadSize > MAX_PAYLOAD_SIZE) {
        return res.status(413).json({ error: 'Payload too large.' });
    }

    const { action, payload } = req.body;

    // 4. Validar Action Strict
    if (!action || !isAllowedAction(action)) {
        return res.status(400).json({ error: 'Invalid action.' });
    }

    // 5. Validar API Key Servidor
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error("Critical: GOOGLE_API_KEY not configured.");
        return res.status(500).json({ error: 'Service configuration error.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    try {
        let responseData;

        // Lógica Principal
        switch (action) {
            case 'suggestUnidades': {
                const { disciplina, context } = payload;
                if (!disciplina) throw new Error("Missing disciplina data");

                const prompt = `
                Contexto: Professor de ${disciplina.nome} para a série ${disciplina.serie} (${disciplina.nivel}).
                Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
                
                Tarefa: Sugira 5 temas de unidades de ensino (apenas os títulos) que sejam adequados para esta disciplina e série, integrando conceitos de computação e cultura digital alinhados à BNCC.
                
                Formato de Resposta: Um array JSON de strings.
                `;

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096, temperature: 0.7 }
                });
                responseData = cleanAndParseJSON(result.response.text());
                break;
            }

            case 'generatePlanoAula': {
                const { unidade, habilidadesBNCC, context, enrichedContext } = payload;
                if (!unidade || !habilidadesBNCC) throw new Error("Missing required payload data");

                const bnccContext = habilidadesBNCC.map((h: any) => `- [${h.codigo}] ${h.descricao}`).join("\n");
                const codigosBNCC = habilidadesBNCC.map((h: any) => h.codigo).join(", ");

                const baseContext = `
                Contexto: Planejamento de aula para a unidade "${unidade.tema}" para a disciplina de ${unidade.disciplina?.nome || "Geral"}.
                Contexto Adicional: ${context ? JSON.stringify(context) : "Nenhum"}.
                ${enrichedContext ? `ENRIQUECIMENTO PEDAGÓGICO:\n${enrichedContext}\n` : ""}
                BASE LEGAL (CÓDIGOS BNCC):
                ${bnccContext}
                `;

                const metadataPrompt = `
                ${baseContext}
                TAREFA: Gere APENAS a estrutura de metadados do Plano de Aula.
                Formato de Resposta (JSON): { "titulo": "...", "duracao": "...", "objetivos": [], "conteudo_programatico": "...", "metodologia": "...", "recursos_didaticos": [], "avaliacao": "..." }
                `;

                const contentPrompt = `
                ${baseContext}
                TAREFA: Gere o CONTEÚDO DETALHADO do Plano de Aula em formato MARKDOWN.
                NÃO retorne JSON. Retorne apenas o texto Markdown.
                ESTRUTURA OBRIGATÓRIA (Use Markdown):
                # [TÍTULO]
                > **Visão Geral**: ...
                ## 1. Identificação e Objetivos
                ...
                ## 2. Preparação
                ...
                ## 3. Desenvolvimento
                ...
                ## 4. Atividade Prática
                ...
                ## 5. Avaliação
                ...
                `;

                const [metadataResult, contentResult] = await Promise.all([
                    model.generateContent({
                        contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + metadataPrompt }] }],
                        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
                    }),
                    model.generateContent({
                        contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + contentPrompt }] }],
                        generationConfig: { responseMimeType: "text/plain", maxOutputTokens: 8192, temperature: 0.7 }
                    })
                ]);

                const metadata = cleanAndParseJSON(metadataResult.response.text());
                const content = contentResult.response.text();
                responseData = { ...metadata, conteudo: content };
                break;
            }

            case 'generateAtividade': {
                const { unidade, habilidadesBNCC, options, context } = payload;
                if (!unidade || !habilidadesBNCC || !options) throw new Error("Missing required payload data");

                const bnccContext = habilidadesBNCC.map((h: any) => `- [${h.codigo}] ${h.descricao}`).join("\n");
                const codigosBNCC = habilidadesBNCC.map((h: any) => h.codigo).join(", ");

                let contextPlano = "";
                if (unidade.plano_aula && unidade.plano_aula.conteudo) {
                    contextPlano = `
                    ATENÇÃO: A atividade deve ser baseada ESTRITAMENTE no seguinte conteúdo que foi ensinado no Plano de Aula:
                    ${unidade.plano_aula.conteudo.substring(0, 3000)}...
                    Certifique-se que as questões avaliem conceitos presentes neste texto.
                    `;
                }

                const prompt = `
                Contexto: Atividade avaliativa para a unidade "${unidade.tema}".
                Contexto do Usuário: ${context ? JSON.stringify(context) : "Nenhum contexto adicional"}.
                ${contextPlano}
                Configurações: ${options.objectiveCount} objetivas, ${options.subjectiveCount} dissertativas. Dificuldade: ${options.difficulty}.
                Habilidades BNCC: ${bnccContext} (Usar apenas: ${codigosBNCC})
                
                Tarefa: Crie uma atividade avaliativa JSON com questões.
                Formato de Resposta (JSON): { "titulo": "...", "tipo": "...", "instrucoes": "...", "pontuacao_total": 10, "questoes": [...] }
                `;

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 8192, temperature: 0.7 }
                });
                responseData = cleanAndParseJSON(result.response.text());
                break;
            }

            case 'generateSlides': {
                const { unidade, habilidadesBNCC, context } = payload;
                if (!unidade || !habilidadesBNCC) throw new Error("Missing required payload data");

                const bnccContext = habilidadesBNCC.map((h: any) => `- [${h.codigo}] ${h.descricao}`).join("\n");

                let contextPlano = "";
                if (unidade.plano_aula && unidade.plano_aula.conteudo) {
                    contextPlano = `
                    IMPORTANTE: Os slides devem refletir EXATAMENTE a estrutura e conteúdo do Plano de Aula já gerado abaixo:
                    ${unidade.plano_aula.conteudo.substring(0, 3000)}...
                    Não invente tópicos novos.
                    `;
                }

                const prompt = `
                Aja como um designer instrucional. Crie slides sobre: "${unidade.tema}".
                Contexto: ${context ? JSON.stringify(context) : "Nenhum"}.
                ${contextPlano}
                Habilidades BNCC: ${bnccContext}
                
                Retorne ARRAY JSON de slides: [{ "titulo": "...", "conteudo": ["..."], "imagem_sugerida": "...", "roteiro_professor": "..." }]
                `;

                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + prompt }] }],
                    generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096, temperature: 0.7 }
                });
                responseData = cleanAndParseJSON(result.response.text());
                break;
            }
        }

        res.status(200).json(responseData);

    } catch (error: any) {
        console.error("Error in serverless function:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
        });
    }
}
