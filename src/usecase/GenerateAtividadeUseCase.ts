
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

        // Ensure defaults for required fields
        const atividadeToSave = {
            titulo: generatedAtividade.titulo || `Atividade: ${unidade.tema}`,
            tipo: generatedAtividade.tipo || 'Exercício',
            instrucoes: generatedAtividade.instrucoes || 'Responda as questões abaixo.',
            questoes: generatedAtividade.questoes || [],
            criterios_avaliacao: generatedAtividade.criterios_avaliacao || '',
            pontuacao_total: generatedAtividade.pontuacao_total || 10,
            unidade_id: unidade.id
        };

        const savedAtividade = await this.repository.createAtividade(atividadeToSave);
        return savedAtividade;
    }
}
