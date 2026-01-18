import { IAIService } from '../model/services/IAIService';
import { IUserRepository } from '../model/repositories/IUserRepository';
import { Disciplina } from '../model/entities';

export class SuggestUnidadesUseCase {
    constructor(
        private aiService: IAIService,
        private userRepository: IUserRepository
    ) { }

    async execute(disciplina: Disciplina, userId?: string) {
        let context;
        if (userId) {
            context = await this.userRepository.getUserContext(userId) || undefined;
        }
        return await this.aiService.suggestUnidades(disciplina, context);
    }
}
