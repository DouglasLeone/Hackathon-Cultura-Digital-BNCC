import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IUserRepository } from '../model/repositories/IUserRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';
import { AtividadeSchema } from '../model/schemas';

export class GenerateAtividadeUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService,
        private userRepository: IUserRepository,
        private bnccRepository: BNCCRepository
    ) { }

    async execute(unidade: Unidade, userId?: string, options?: import('../model/services/IAIService').ActivityGenerationOptions) {
        let context;
        if (userId) {
            context = await this.userRepository.getUserContext(userId) || undefined;
        }

        let habilidadesBNCC: import('../model/entities').HabilidadeBNCC[] = [];
        if (unidade.disciplina) {
            habilidadesBNCC = this.bnccRepository.findByContext(unidade.disciplina, unidade);
        }

        const defaultOptions: import('../model/services/IAIService').ActivityGenerationOptions = {
            objectiveCount: 3,
            subjectiveCount: 2,
            difficulty: 'Médio'
        };

        const finalOptions = options || defaultOptions;

        const generatedAtividade = await this.aiService.generateAtividade(unidade, habilidadesBNCC, finalOptions, context);

        // Validate AI response
        const validationResult = AtividadeSchema.safeParse(generatedAtividade);
        if (!validationResult.success) {
            console.warn('⚠️ AI response validation failed for Atividade:', validationResult.error.errors);
        }

        // Ensure defaults for required fields
        const atividadeToSave = {
            titulo: generatedAtividade.titulo || `Atividade: ${unidade.tema}`,
            tipo: generatedAtividade.tipo || 'Exercício',
            instrucoes: generatedAtividade.instrucoes || 'Responda as questões abaixo.',
            questoes: generatedAtividade.questoes || [],
            criterios_avaliacao: generatedAtividade.criterios_avaliacao || '',
            pontuacao_total: generatedAtividade.pontuacao_total || 10,
            habilidades_possiveis: habilidadesBNCC, // Added missing field for UI feedback
            unidade_id: unidade.id
        };

        const savedAtividade = await this.repository.createAtividade(atividadeToSave);

        // Match return pattern of PlanoAulaUseCase for consistency
        if (savedAtividade && !savedAtividade.habilidades_possiveis) {
            savedAtividade.habilidades_possiveis = habilidadesBNCC;
        }

        return savedAtividade;
    }
}
