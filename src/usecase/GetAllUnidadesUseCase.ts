
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class GetAllUnidadesUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute() {
        return await this.repository.getAll();
    }
}
