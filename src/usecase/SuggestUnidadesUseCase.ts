
import { IAIService } from '../model/services/IAIService';
import { Disciplina } from '../model/entities';

export class SuggestUnidadesUseCase {
    constructor(private aiService: IAIService) { }

    async execute(disciplina: Disciplina) {
        return await this.aiService.suggestUnidades(disciplina);
    }
}
