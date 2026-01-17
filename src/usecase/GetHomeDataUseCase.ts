
import { IGenIARepository } from '../model/repositories/IGenIARepository';

export class GetHomeDataUseCase {
    constructor(private repository: IGenIARepository) { }

    async execute() {
        const [stats, historico] = await Promise.all([
            this.repository.getStats(),
            this.repository.getHistorico()
        ]);

        return { stats, historico };
    }
}
