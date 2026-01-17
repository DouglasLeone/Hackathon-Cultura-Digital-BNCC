
import { PlanoAula } from '../model/entities';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class UpdatePlanoAulaUseCase {
    constructor(private repository: IUnidadeRepository) { }

    async execute(id: string, plano: Partial<PlanoAula>): Promise<PlanoAula> {
        return await this.repository.updatePlanoAula(id, plano);
    }
}
