
import { IAIService } from '../../model/services/IAIService';
import { Disciplina } from '../../model/entities';

export class MockAIService implements IAIService {
    async suggestUnidades(disciplina: Disciplina): Promise<string[]> {
        // Simulating API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const suggestions = [
            `Introduction to ${disciplina.nome}`,
            `Advanced ${disciplina.nome} Concepts`,
            `${disciplina.nome} in Practice`,
            `History of ${disciplina.nome}`,
            `Future of ${disciplina.nome}`
        ];

        if (disciplina.serie) {
            suggestions.push(`${disciplina.nome} for ${disciplina.serie} Level 1`);
            suggestions.push(`${disciplina.nome} projects for ${disciplina.serie}`);
        }

        return suggestions;
    }
}
