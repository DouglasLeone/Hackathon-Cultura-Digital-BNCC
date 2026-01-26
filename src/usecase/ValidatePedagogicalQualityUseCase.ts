import { PlanoAula, HabilidadeBNCC } from '../model/entities';

export interface QualityIssue {
    severity: 'critical' | 'warning' | 'info';
    category: 'alignment' | 'structure' | 'depth' | 'clarity';
    message: string;
}

export interface QualityReport {
    score: number; // 0-100
    issues: QualityIssue[];
    suggestions: string[];
    approved: boolean;
}

export class ValidatePedagogicalQualityUseCase {
    async execute(planoAula: Partial<PlanoAula>, habilidadesBNCC: HabilidadeBNCC[]): Promise<QualityReport> {
        const issues: QualityIssue[] = [];
        let score = 100;

        // --- OPÇÃO 1: VALIDAÇÃO RÁPIDA (Básica) ---

        // 1. Verificar Alinhamento BNCC (Crucial para o Hackathon)
        const mentionsBNCC = this.validateBNCCAlignment(planoAula, habilidadesBNCC);
        if (!mentionsBNCC) {
            issues.push({
                severity: 'critical',
                category: 'alignment',
                message: 'O plano não menciona explicitamente os códigos das habilidades BNCC sugeridas no conteúdo.'
            });
            score -= 30;
        }

        // 2. Quantidade de Objetivos
        if (!planoAula.objetivos || planoAula.objetivos.length < 3) {
            issues.push({
                severity: 'warning',
                category: 'structure',
                message: 'Um plano de aula robusto deve ter pelo menos 3 objetivos de aprendizagem específicos.'
            });
            score -= 10;
        }

        // 3. Extensão do Conteúdo (Opção 1)
        const contentText = planoAula.conteudo || '';
        if (contentText.length < 500) {
            issues.push({
                severity: 'warning',
                category: 'depth',
                message: 'O conteúdo detalhado está muito curto. Planos premium devem ser mais explicativos.'
            });
            score -= 15;
        }

        // --- OPÇÃO 2: SISTEMA INTERMEDIÁRIO (Avançado) ---

        // 4. Verbos de Bloom nos Objetivos
        const hasBloomVerbs = this.checkBloomTaxonomy(planoAula.objetivos || []);
        if (!hasBloomVerbs) {
            issues.push({
                severity: 'info',
                category: 'structure',
                message: 'Considere usar verbos da Taxonomia de Bloom (analisar, criar, aplicar) nos objetivos para maior clareza pedagógica.'
            });
            score -= 5;
        }

        // 5. Duração Realista
        if (planoAula.duracao && !this.isRealisticDuration(planoAula.duracao)) {
            issues.push({
                severity: 'warning',
                category: 'structure',
                message: 'A duração definida parece irrealista para o volume de conteúdo/atividades propostas.'
            });
            score -= 10;
        }

        // 6. Detecção de Conteúdo Genérico
        const genericCount = this.countGenericPhrases(contentText);
        if (genericCount > 5) {
            issues.push({
                severity: 'info',
                category: 'clarity',
                message: 'O texto contém muitas frases genéricas. Tente ser mais específico sobre o contexto da sala de aula brasileira.'
            });
            score -= 5;
        }

        // 7. Presença de Atividade Prática
        if (contentText && !contentText.toLowerCase().includes('prática') && !contentText.toLowerCase().includes('hands-on')) {
            issues.push({
                severity: 'warning',
                category: 'structure',
                message: 'É recomendável incluir uma atividade prática ou "hands-on" para maior engajamento.'
            });
            score -= 10;
        }

        // Finalize score and suggestions
        score = Math.max(0, score);

        return {
            score,
            issues,
            suggestions: this.generateSuggestions(issues),
            approved: score >= 70
        };
    }

    private validateBNCCAlignment(plano: Partial<PlanoAula>, habilidades: HabilidadeBNCC[]): boolean {
        if (habilidades.length === 0) return true; // Se não houver habilidades sugeridas, não penaliza
        const codigosBNCC = habilidades.map(h => h.codigo.toLowerCase());
        const fullText = (plano.conteudo || '').toLowerCase();

        return codigosBNCC.some(codigo => fullText.includes(codigo));
    }

    private checkBloomTaxonomy(objetivos: string[]): boolean {
        const bloomVerbs = [
            'analisar', 'avaliar', 'criar', 'aplicar', 'sintetizar', 'interpretar',
            'identificar', 'comparar', 'explicar', 'desenvolver', 'refletir'
        ];
        return objetivos.some(obj =>
            bloomVerbs.some(verb => obj.toLowerCase().includes(verb))
        );
    }

    private isRealisticDuration(duracao: string): boolean {
        const minutes = parseInt(duracao.match(/\d+/)?.[0] || '0');
        if (minutes === 0) return true; // Se não conseguir parsear, ignora
        return minutes >= 30 && minutes <= 240; // Entre 30min e 4 horas (2 aulas duplas)
    }

    private countGenericPhrases(text: string): number {
        const genericPhrases = [
            'é importante', 'os alunos devem', 'o professor deve', 'nesta aula',
            'objetivo desta aula', 'concluímos que'
        ];
        const lowerText = text.toLowerCase();
        return genericPhrases.reduce((count, phrase) => {
            const regex = new RegExp(phrase, 'gi');
            return count + (lowerText.match(regex)?.length || 0);
        }, 0);
    }

    private generateSuggestions(issues: QualityIssue[]): string[] {
        const suggestions: string[] = [];
        if (issues.some(i => i.category === 'alignment')) {
            suggestions.push('Adicione os códigos das habilidades BNCC (ex: EM13CO01) dentro do texto do plano.');
        }
        if (issues.some(i => i.category === 'structure')) {
            suggestions.push('Refine os objetivos usando verbos de ação e detalhe os tempos de cada etapa da metodologia.');
        }
        if (issues.some(i => i.category === 'depth')) {
            suggestions.push('Expanda a descrição da atividade principal com exemplos práticos do cotidiano dos alunos.');
        }
        return suggestions;
    }
}
