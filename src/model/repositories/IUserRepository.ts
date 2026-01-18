
import { UserContext, NivelEnsino } from '../entities';

export interface IUserRepository {
    getUserContext(userId: string): Promise<UserContext | null>;
    createUserContext(userId: string, niveis: NivelEnsino[]): Promise<UserContext>;
    updateUserContext(userId: string, niveis: NivelEnsino[]): Promise<UserContext>;
}
