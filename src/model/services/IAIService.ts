
import { Disciplina, Unidade } from '../entities';

export interface IAIService {
    suggestUnidades(disciplina: Disciplina): Promise<string[]>;
    generatePlanoAula(unidade: Unidade): Promise<Partial<import('../entities').PlanoAula>>;
    generateAtividade(unidade: Unidade): Promise<Partial<import('../entities').AtividadeAvaliativa>>;
    generateSlides(unidade: Unidade): Promise<{ titulo: string; slides_count: number; url: string; message: string }>;
}
