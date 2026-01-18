
import { IUserRepository } from '../model/repositories/IUserRepository';
import { NivelEnsino } from '../model/entities';

export class UpdateUserContextUseCase {
    constructor(private repository: IUserRepository) { }

    async execute(userId: string, niveis: NivelEnsino[]) {
        return await this.repository.updateUserContext(userId, niveis);
    }
}
