
import { IGenIARepository } from '../model/repositories/IGenIARepository';
import { HistoricoGeracao } from '../model/entities';

export class LogMaterialGenerationUseCase {
    constructor(private repository: IGenIARepository) { }

    async execute(historico: Omit<HistoricoGeracao, 'id' | 'created_at'>) {
        return await this.repository.addHistorico(historico);
    }
}
