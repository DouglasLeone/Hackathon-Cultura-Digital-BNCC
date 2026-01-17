
import { IGenIARepository } from '../model/repositories/IGenIARepository';

export class DeleteHistoricoUseCase {
    constructor(private repository: IGenIARepository) { }

    async execute(id: string) {
        return await this.repository.deleteHistorico(id);
    }
}
