import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';

export class GenerateSlidesUseCase {
    constructor(
        private aiService: IAIService,
        private bnccRepository: BNCCRepository
    ) { }

    async execute(unidade: Unidade) {
        let habilidadesBNCC: any[] = [];
        if (unidade.disciplina) {
            habilidadesBNCC = this.bnccRepository.findByContext(unidade.disciplina, unidade);
        }

        // Slides might not be persisted in the same way or just returned as a link/blob
        // For now we just return the result from AI
        return await this.aiService.generateSlides(unidade, habilidadesBNCC);
    }
}
