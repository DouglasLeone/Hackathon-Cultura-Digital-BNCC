
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';

export class DeleteDisciplinaUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute(id: string) {
        return await this.repository.delete(id);
    }
}
