
import { IUserRepository } from '../model/repositories/IUserRepository';
import { NivelEnsino } from '../model/entities';

export class CreateUserContextUseCase {
    constructor(private repository: IUserRepository) { }

    async execute(userId: string, niveis: NivelEnsino[]) {
        return await this.repository.createUserContext(userId, niveis);
    }
}
