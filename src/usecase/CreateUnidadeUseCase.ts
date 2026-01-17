
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { Unidade } from '../model/entities';

export class CreateUnidadeUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(unidade: Omit<Unidade, 'id' | 'created_at' | 'updated_at' | 'disciplina'>) {
        if (!unidade.tema || !unidade.disciplina_id) {
            throw new Error("Tema e Disciplina são obrigatórios.");
        }
        return await this.repository.create(unidade);
    }
}
