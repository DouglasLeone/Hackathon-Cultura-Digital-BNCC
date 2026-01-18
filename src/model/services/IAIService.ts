
import { Disciplina, Unidade, UserContext } from '../entities';

export interface IAIService {
    suggestUnidades(disciplina: Disciplina, context?: UserContext): Promise<string[]>;
    generatePlanoAula(unidade: Unidade, context?: UserContext): Promise<Partial<import('../entities').PlanoAula>>;
    generateAtividade(unidade: Unidade, context?: UserContext): Promise<Partial<import('../entities').AtividadeAvaliativa>>;
    generateSlides(unidade: Unidade, context?: UserContext): Promise<{ titulo: string; slides_count: number; url: string; message: string }>;
}
