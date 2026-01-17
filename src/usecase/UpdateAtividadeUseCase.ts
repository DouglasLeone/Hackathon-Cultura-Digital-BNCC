
import { AtividadeAvaliativa } from '../model/entities';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class UpdateAtividadeUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
        return await this.repository.updateAtividade(id, atividade);
    }
}
