import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

import { SlidesSchema } from '../model/schemas';

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

        const rawSlides = await this.aiService.generateSlides(unidade, habilidadesBNCC);

        // Wrap to match Schema
        let slidesObject = {
            titulo: `Slides: ${unidade.tema}`,
            conteudo: rawSlides
        };

        // Validate
        const validationResult = SlidesSchema.safeParse(slidesObject);
        if (!validationResult.success) {
            console.warn('⚠️ AI response validation failed for Slides:', validationResult.error.errors);
            // Fallback
            slidesObject = {
                titulo: `Slides: ${unidade.tema}`,
                conteudo: []
            };
        }

        // Persist generated slides
        const savedSlides = await this.repository.createMaterialSlides({
            unidade_id: unidade.id,
            titulo: slidesObject.titulo,
            conteudo: slidesObject.conteudo,
            habilidades_possiveis: habilidadesBNCC,
            arquivado: false
        });

        return savedSlides;
    }
}
