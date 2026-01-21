import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class GenerateSlidesUseCase {
    constructor(
        private aiService: IAIService,
        private bnccRepository: BNCCRepository,
        private repository: IUnidadeRepository
    ) { }

    async execute(unidade: Unidade) {
        let habilidadesBNCC: import('../model/entities').HabilidadeBNCC[] = [];
        if (unidade.disciplina) {
            habilidadesBNCC = this.bnccRepository.findByContext(unidade.disciplina, unidade);
        }

        const generatedContent = await this.aiService.generateSlides(unidade, habilidadesBNCC);

        // Persist generated slides
        const savedSlides = await this.repository.createMaterialSlides({
            unidade_id: unidade.id,
            titulo: `Slides: ${unidade.tema}`,
            conteudo: generatedContent,
            arquivado: false
        });

        return savedSlides;
    }
}
