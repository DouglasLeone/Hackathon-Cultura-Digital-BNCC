import { IUnidadeRepository } from "../model/repositories/IUnidadeRepository";
import { MaterialSlides } from "../model/entities";
import { IGenIARepository } from "../model/repositories/IGenIARepository";

export class UpdateSlidesUseCase {
    constructor(
        private unidadeRepository: IUnidadeRepository,
        private genIARepository: IGenIARepository
    ) { }

    async execute(id: string, data: Partial<MaterialSlides>) {
        await this.unidadeRepository.updateMaterialSlides(id, data);

        // Sync with history if archiving
        if (data.arquivado !== undefined) {
            const historico = await this.genIARepository.getHistoricoByReferenceId(id);
            if (historico) {
                await this.genIARepository.updateHistorico(historico.id, { arquivado: data.arquivado });
            }
        }
    }
}
