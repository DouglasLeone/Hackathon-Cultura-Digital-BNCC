import bnccData from '../data/bncc_complete.json';
import { Disciplina, Unidade, HabilidadeBNCC } from "../../model/entities";

// Force casting the JSON import to HabilidadeBNCC[]
const BNCC_DATA: HabilidadeBNCC[] = bnccData as unknown as HabilidadeBNCC[];

export class BNCCRepository {
    findByContext(disciplina: Disciplina, unidade: Unidade): HabilidadeBNCC[] {
        // Normalização para comparação (remove açentos e lowercase se necessário, mas aqui faremos simples)
        const normalize = (str: string) => str.toLowerCase().trim();

        return BNCC_DATA.filter(h => {
            const matchNivel = normalize(h.nivel) === normalize(disciplina.nivel);
            const matchArea = normalize(h.area) === normalize(disciplina.area);

            // Check if disciplina.serie is included in h.serie array
            // h.serie in new JSON is array of strings: ["1º Ano", "2º Ano", "3º Ano"]
            // disciplina.serie is string: "1º Ano - Ensino Médio"
            const serieClean = disciplina.serie.split('-')[0].trim(); // "1º Ano"

            // Handle h.serie being an array (new format) or string (if mixed)
            const hSerie = Array.isArray(h.serie) ? h.serie : [h.serie];
            const matchSerie = hSerie.some(s => normalize(s) === normalize(serieClean));

            // We rely on Area matching primarily. Componente check is tricky with generic files.
            // But we can check if it aligns.
            // For now, let's keep it broader: Match Nivel, Area, Serie.

            return matchNivel && matchArea && matchSerie;
        });
    }
}
