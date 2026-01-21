import { AtividadeAvaliativa } from '../model/entities';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IGenIARepository } from '../model/repositories/IGenIARepository';

export class UpdateAtividadeUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private genIARepository: IGenIARepository
    ) { }

    async execute(id: string, atividade: Partial<AtividadeAvaliativa>): Promise<AtividadeAvaliativa> {
        const updatedAtividade = await this.repository.updateAtividade(id, atividade);

        // Sync with Historico if 'arquivado' status changed
        if (atividade.arquivado !== undefined) {
            try {
                const historyItem = await this.genIARepository.getHistoricoByReferenceId(id);
                if (historyItem) {
                    await this.genIARepository.updateHistorico(historyItem.id, { arquivado: atividade.arquivado });
                }
            } catch (error) {
                console.error('Failed to sync archive status with history:', error);
                // Don't fail the main operation if sync fails
            }
        }

        return updatedAtividade;
    }
}
