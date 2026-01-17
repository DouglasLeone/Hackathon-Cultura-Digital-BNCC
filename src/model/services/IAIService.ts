
import { Disciplina, Unidade } from '../entities';

export interface IAIService {
    suggestUnidades(disciplina: Disciplina): Promise<string[]>;
    generatePlanoAula(unidade: Unidade): Promise<any>;
    generateAtividade(unidade: Unidade): Promise<any>;
    generateSlides(unidade: Unidade): Promise<any>;
}
