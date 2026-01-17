
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

        // Ensure defaults for required fields if AI returns partial data
        const planoToSave = {
            titulo: generatedPlano.titulo || `Plano de Aula: ${unidade.tema}`,
            duracao: generatedPlano.duracao || '50 minutos',
            objetivos: generatedPlano.objetivos || [],
            conteudo_programatico: generatedPlano.conteudo_programatico || '',
            metodologia: generatedPlano.metodologia || '',
            recursos_didaticos: generatedPlano.recursos_didaticos || [],
            avaliacao: generatedPlano.avaliacao || '',
            conteudo: generatedPlano.conteudo || '',
            unidade_id: unidade.id
        };

        const savedPlano = await this.repository.createPlanoAula(planoToSave);
        return savedPlano;
    }
}
