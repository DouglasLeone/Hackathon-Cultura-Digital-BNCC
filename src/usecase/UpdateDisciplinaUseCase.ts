
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';
import { Disciplina } from '../model/entities';

export class UpdateDisciplinaUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute(id: string, disciplina: Partial<Disciplina>) {
        return await this.repository.update(id, disciplina);
    }
}
