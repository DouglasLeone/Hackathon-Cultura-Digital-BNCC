
import { Disciplina } from '../entities';

export interface IAIService {
    suggestUnidades(disciplina: Disciplina): Promise<string[]>;
}
