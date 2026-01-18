
import { IUserRepository } from '../model/repositories/IUserRepository';

export class GetUserContextUseCase {
    constructor(private repository: IUserRepository) { }

    async execute(userId: string) {
        return await this.repository.getUserContext(userId);
    }
}
