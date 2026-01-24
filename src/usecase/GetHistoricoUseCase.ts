
import { IGenIARepository } from '../model/repositories/IGenIARepository';

export class GetHistoricoUseCase {
    constructor(private repository: IGenIARepository) { }

    async execute() {
        return await this.repository.getHistorico();
    }
}
