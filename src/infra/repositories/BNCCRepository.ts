import { getAllBnccData, getBnccByLevel } from '../data/bncc';
import { Disciplina, Unidade, HabilidadeBNCC } from "../../model/entities";

export class BNCCRepository {
    findByContext(disciplina: Disciplina, unidade: Unidade): HabilidadeBNCC[] {
        // Normalização para comparação
        const normalize = (str: string) => str.toLowerCase().trim();

        // Determinar qual dataset usar com base no nível da disciplina
        // Se não conseguir determinar, busca em tudo (fallback)
        let dataset: HabilidadeBNCC[] = [];
        const nivelNormalizado = normalize(disciplina.nivel);

        if (nivelNormalizado.includes('médio') || nivelNormalizado.includes('medio')) {
            dataset = getBnccByLevel('medio');
        } else if (nivelNormalizado.includes('fundamental')) {
            dataset = getBnccByLevel('fundamental');
        } else {
            dataset = getAllBnccData();
        }

        return dataset.filter(h => {
            // Match Area
            const matchArea = normalize(h.area) === normalize(disciplina.area);

            // Match Série
            // disciplina.serie geralmente é "1º Ano - Ensino Médio" ou "6º Ano"
            // h.serie agora é SEMPRE um array: ["1º Ano", "2º Ano"]

            // Extrair apenas a parte inicial da string da série da disciplina (ex: "1º Ano")
            const serieClean = disciplina.serie.split('-')[0].trim();

            const matchSerie = h.serie.some(s => normalize(s) === normalize(serieClean));

            // Componente (Opcional, mas bom para filtrar se especificado)
            // Se a disciplina tiver componente específico (ex: História), tentar filtrar.
            // Mas muitas vezes 'disciplina.nome' é o componente.
            // Vamos ser permissivos: Se h.componente bater com disciplina.nome OU se não tivermos certeza, aceita (desde que area e serie batam).
            // Para simplificar e garantir retorno, focamos em Area e Serie que são mais estruturais.
            // Se quiser refinar:
            const matchComponente = normalize(h.componente) === normalize(disciplina.nome);

            // Retornar baseando-se principalmente em Serie e Area, que são os filtros mais fortes hierarquicamente
            if (matchArea && matchSerie) {
                // Se area e serie batem, verificamos componente como critério de desempate/refinamento se houver ambiguidade
                // Mas no contexto atual, Area + Serie costuma ser suficiente ou pelo menos seguro.
                // Adicionalmente, se o componente bater exatamente, é um match perfeito.
                if (matchComponente) return true;

                // Se a área for a mesma (ex: Ciencias Humanas) e série tbm, é um candidato válido.
                return true;
            }

            return false;
        }) as HabilidadeBNCC[]; // Cast as HabilidadeBNCC compatible (structure is aligned)
    }
}
