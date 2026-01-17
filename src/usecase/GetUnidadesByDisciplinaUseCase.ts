
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class GetUnidadesByDisciplinaUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(disciplinaId: string) {
        return await this.repository.getByDisciplinaId(disciplinaId);
    }
}
