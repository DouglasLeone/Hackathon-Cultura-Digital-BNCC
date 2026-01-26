import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IUserRepository } from '../model/repositories/IUserRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade, HabilidadeBNCC } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';
import { EnrichThemeUseCase } from './EnrichThemeUseCase';
import { ValidatePedagogicalQualityUseCase } from './ValidatePedagogicalQualityUseCase';
import { PlanoAulaSchema } from '../model/schemas';

export class GeneratePlanoAulaUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService,
        private userRepository: IUserRepository,
        private bnccRepository: BNCCRepository,
        private enrichThemeUseCase: EnrichThemeUseCase,
        private validateQualityUseCase: ValidatePedagogicalQualityUseCase
    ) { }

    async execute(unidade: Unidade, userId?: string) {
        let context;
        if (userId) {
            context = await this.userRepository.getUserContext(userId) || undefined;
        }

        let habilidadesBNCC: HabilidadeBNCC[] = [];
        if (unidade.disciplina) {
            habilidadesBNCC = this.bnccRepository.findByContext(unidade.disciplina, unidade);
        }

        const enrichedContext = await this.enrichThemeUseCase.execute(unidade.tema, unidade.disciplina!, habilidadesBNCC);

        const generatedPlano = await this.aiService.generatePlanoAula(unidade, habilidadesBNCC, context, enrichedContext);

        // Validate AI response structure
        const validationResult = PlanoAulaSchema.safeParse(generatedPlano);
        if (!validationResult.success) {
            console.warn('⚠️ AI response validation failed:', validationResult.error.errors);
        }

        // ✨ Perform Pedagogical Quality Check
        const qualityReport = await this.validateQualityUseCase.execute(generatedPlano, habilidadesBNCC);

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
            habilidades_bncc_usadas: generatedPlano.habilidades_bncc_usadas || [],
            habilidades_possiveis: habilidadesBNCC,
            quality_score: qualityReport.score,
            quality_issues: qualityReport.issues,
            created_at: new Date().toISOString(),
            unidade_id: unidade.id
        };

        const savedPlano = await this.repository.createPlanoAula(planoToSave);

        // Ensure the returned object has the feedback, even if repo didn't return it (though it should)
        if (savedPlano && !savedPlano.habilidades_possiveis) {
            savedPlano.habilidades_possiveis = habilidadesBNCC;
        }

        return savedPlano;
    }
}
