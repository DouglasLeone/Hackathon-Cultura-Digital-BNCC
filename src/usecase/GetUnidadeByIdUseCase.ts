
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class GetUnidadeByIdUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(id: string) {
        return await this.repository.getById(id);
    }
}
