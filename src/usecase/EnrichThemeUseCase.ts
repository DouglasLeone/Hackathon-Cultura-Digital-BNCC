import { Disciplina, HabilidadeBNCC } from '../model/entities';

export class EnrichThemeUseCase {
    async execute(tema: string, disciplina: Disciplina, habilidadesBNCC: HabilidadeBNCC[]): Promise<string> {
        // 1. Detectar palavras-chave do tema
        const keywords = this.extractKeywords(tema);

        // 2. Buscar habilidades BNCC mais relevantes
        const relevantSkills = habilidadesBNCC
            .filter(h => this.isRelevant(h.descricao, keywords))
            .slice(0, 3); // Top 3

        // 3. Criar contexto enriquecido
        const enrichedContext = `
    TEMA: ${tema}
    DISCIPLINA: ${disciplina.nome} - ${disciplina.serie} (${disciplina.nivel})
    
    FOCO PEDAGÓGICO:
    ${relevantSkills.length > 0
                ? relevantSkills.map(h => `- [${h.codigo}] ${h.descricao}`).join('\n')
                : 'Utilize o tema como base para identificar as competências BNCC mais adequadas.'}
    
    ORIENTAÇÕES ESPECÍFICAS:
    - Nível de profundidade adequado para ${disciplina.serie}
    - Relacionar com cotidiano do aluno
    - Incluir exemplos práticos brasileiros
    - Evitar jargões sem explicação
    `;

        return enrichedContext;
    }

    private extractKeywords(tema: string): string[] {
        // Remove palavras de parada (stop words) comuns em português
        const stopWords = ['a', 'o', 'de', 'da', 'do', 'em', 'para', 'com', 'os', 'as', 'dos', 'das', 'um', 'uma', 'sobre', 'sob'];
        return tema.toLowerCase()
            .split(/[\s,.;:!?]+/)
            .filter(w => w.length > 3 && !stopWords.includes(w));
    }

    private isRelevant(descricao: string, keywords: string[]): boolean {
        const desc = descricao.toLowerCase();
        return keywords.some(kw => desc.includes(kw));
    }
}
