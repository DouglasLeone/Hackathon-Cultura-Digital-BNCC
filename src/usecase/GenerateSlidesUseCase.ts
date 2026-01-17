
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';

export class GenerateSlidesUseCase {
    constructor(private aiService: IAIService) { }

    async execute(unidade: Unidade) {
        // Slides might not be persisted in the same way or just returned as a link/blob
        // For now we just return the result from AI
        return await this.aiService.generateSlides(unidade);
    }
}
