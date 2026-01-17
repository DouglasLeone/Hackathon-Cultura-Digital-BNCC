
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';

export class GenerateAtividadeUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService
    ) { }

    async execute(unidade: Unidade) {
        const generatedAtividade = await this.aiService.generateAtividade(unidade);
        // Persist the generated activity
        const savedAtividade = await this.repository.createAtividade({
            ...generatedAtividade,
            unidade_id: unidade.id
        });
        return savedAtividade;
    }
}
