
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';

export class GetAllDisciplinasUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute() {
        return await this.repository.getAll();
    }
}
