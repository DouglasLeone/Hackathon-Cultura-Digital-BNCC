import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IUserRepository } from '../model/repositories/IUserRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';

export class GeneratePlanoAulaUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService,
        private userRepository: IUserRepository
    ) { }

    async execute(unidade: Unidade, userId?: string) {
        let context;
        if (userId) {
            context = await this.userRepository.getUserContext(userId) || undefined;
        }
        const generatedPlano = await this.aiService.generatePlanoAula(unidade, context);

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
