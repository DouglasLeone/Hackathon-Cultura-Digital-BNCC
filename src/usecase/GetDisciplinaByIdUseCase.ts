
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';

export class GetDisciplinaByIdUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute(id: string) {
        return await this.repository.getById(id);
    }
}
