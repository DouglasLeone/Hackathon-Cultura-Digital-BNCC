import { PlanoAula } from '../model/entities';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IGenIARepository } from '../model/repositories/IGenIARepository';

export class UpdatePlanoAulaUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private genIARepository: IGenIARepository
    ) { }

    async execute(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
        const updatedPlano = await this.repository.updatePlanoAula(id, plano);

        // Sync with Historico if 'arquivado' status changed
        if (plano.arquivado !== undefined) {
            try {
                const historyItem = await this.genIARepository.getHistoricoByReferenceId(id);
                if (historyItem) {
                    await this.genIARepository.updateHistorico(historyItem.id, { arquivado: plano.arquivado });
                }
            } catch (error) {
                console.error('Failed to sync archive status with history:', error);
                // Don't fail the main operation if sync fails
            }
        }

        return updatedPlano;
    }
}
