
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class DeleteUnidadeUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(id: string) {
        return await this.repository.delete(id);
    }
}
