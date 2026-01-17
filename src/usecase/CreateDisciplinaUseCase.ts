
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';
import { Disciplina } from '../model/entities';

export class CreateDisciplinaUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at'>) {
        if (!disciplina.nome || !disciplina.serie) {
            throw new Error("Nome e Série são obrigatórios.");
        }
        return await this.repository.create(disciplina);
    }
}
