
import { IGenIARepository } from '../model/repositories/IGenIARepository';
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';
import { IUnidadeRepository } from '../model/repositories/IUnidadeRepository';

export class GetHomeDataUseCase {
    constructor(
        private repository: IGenIARepository,
        private disciplinaRepository: IDisciplinaRepository,
        private unidadeRepository: IUnidadeRepository
    ) { }

    async execute() {
        const [stats, historicoData, disciplinas, unidades] = await Promise.all([
            this.repository.getStats(),
            this.repository.getHistorico(),
            this.disciplinaRepository.getAll(),
            this.unidadeRepository.getAll()
        ]);

        // Enrich with names
        const historico = historicoData.map(h => ({
            ...h,
            disciplina: disciplinas.find(d => d.id === h.disciplina_id)
                ? { nome: disciplinas.find(d => d.id === h.disciplina_id)!.nome }
                : undefined,
            unidade: unidades.find(u => u.id === h.unidade_id)
                ? { tema: unidades.find(u => u.id === h.unidade_id)!.tema }
                : undefined
        }));

        return { stats, historico };
    }
}
