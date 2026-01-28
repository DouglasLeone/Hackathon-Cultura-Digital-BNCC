import { Disciplina, Unidade, UserContext, HabilidadeBNCC, SlideContent } from '../entities';

export interface ActivityGenerationOptions {
    objectiveCount: number;
    subjectiveCount: number;
    difficulty: 'Fácil' | 'Médio' | 'Difícil';
}

export interface IAIService {
    suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]>;
    generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext, enrichedContext?: string): Promise<Partial<import('../entities').PlanoAula>>;
    generateAtividade(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], options: ActivityGenerationOptions, context?: UserContext): Promise<Partial<import('../entities').AtividadeAvaliativa>>;
    generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<SlideContent[]>;
}
