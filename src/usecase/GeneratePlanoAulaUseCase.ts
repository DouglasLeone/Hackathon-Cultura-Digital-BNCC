
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';

export class GeneratePlanoAulaUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService
    ) { }

    async execute(unidade: Unidade) {
        const generatedPlano = await this.aiService.generatePlanoAula(unidade);
        // Persist the generated plan
        const savedPlano = await this.repository.createPlanoAula({
            ...generatedPlano,
            unidade_id: unidade.id
        });
        return savedPlano;
    }
}
