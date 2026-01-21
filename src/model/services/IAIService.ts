import { Disciplina, Unidade, UserContext, HabilidadeBNCC } from '../entities';

export interface SlideContent {
    titulo: string;
    conteudo: string[];
    anotacoes?: string;
}

export interface IAIService {
    suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]>;
    generatePlanoAula(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<import('../entities').PlanoAula>>;
    generateAtividade(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<Partial<import('../entities').AtividadeAvaliativa>>;
    generateSlides(unidade: Unidade, habilidadesBNCC: HabilidadeBNCC[], context?: UserContext): Promise<SlideContent[]>;
}
