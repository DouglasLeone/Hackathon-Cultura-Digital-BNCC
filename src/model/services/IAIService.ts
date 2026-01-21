import { Disciplina, Unidade, UserContext, HabilidadeBNCC } from '../entities';

export interface IAIService {
    suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]>;
    generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<import('../entities').PlanoAula>>;
    generateAtividade(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<import('../entities').AtividadeAvaliativa>>;
    generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<{ titulo: string; slides_count: number; url: string; message: string }>;
}
