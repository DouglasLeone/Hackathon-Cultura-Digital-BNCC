
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { Unidade } from '../model/entities';

export class UpdateUnidadeUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(id: string, unidade: Partial<Unidade>) {
        return await this.repository.update(id, unidade);
    }
}
