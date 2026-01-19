
import { IDisciplinaRepository } from '../model/repositories/IDisciplinaRepository';
import { Disciplina, SERIES_FUNDAMENTAL } from '../model/entities';

export class CreateDisciplinaUseCase {
    constructor(private repository: IDisciplinaRepository) { }

    async execute(disciplina: Omit<Disciplina, 'id' | 'created_at' | 'updated_at' | 'nivel'>) {
        const cleanNome = disciplina.nome.trim();
        const cleanArea = disciplina.area ? disciplina.area.trim() : '';
        const cleanSerie = disciplina.serie;

        if (!cleanNome || !cleanSerie || !cleanArea) {
            throw new Error("Nome, Série e Área são obrigatórios.");
        }

        // Infer Nivel
        const isFundamental = SERIES_FUNDAMENTAL.some(s => s === cleanSerie);
        const nivel = isFundamental ? 'Ensino Fundamental' : 'Ensino Médio';

        const cleanDisciplina = {
            ...disciplina,
            nome: cleanNome,
            area: cleanArea,
            serie: cleanSerie,
            nivel: nivel
        };

        console.log("Creating disciplina with payload:", cleanDisciplina);

        return await this.repository.create(cleanDisciplina);
    }
}
