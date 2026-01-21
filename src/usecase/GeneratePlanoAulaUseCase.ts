import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';
import { IUserRepository } from '../model/repositories/IUserRepository';
import { IAIService } from '../model/services/IAIService';
import { Unidade } from '../model/entities';
import { BNCCRepository } from '../infra/repositories/BNCCRepository';

export class GeneratePlanoAulaUseCase {
    constructor(
        private repository: IUnidadeRepository,
        private aiService: IAIService,
        private userRepository: IUserRepository,
        private bnccRepository: BNCCRepository
    ) { }

    async execute(unidade: Unidade, userId?: string) {
        let context;
        if (userId) {
            context = await this.userRepository.getUserContext(userId) || undefined;
        }

        let habilidadesBNCC: any[] = [];
        if (unidade.disciplina) {
            habilidadesBNCC = this.bnccRepository.findByContext(unidade.disciplina, unidade);
        }

        const generatedPlano = await this.aiService.generatePlanoAula(unidade, habilidadesBNCC, context);

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
            habilidades_possiveis: habilidadesBNCC, // Attach RAG results here for feedback
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
