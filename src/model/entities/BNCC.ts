export type NivelEnsino = 'Ensino Fundamental' | 'Ensino Médio';

export interface HabilidadeBNCC {
    codigo: string;
    nivel: NivelEnsino;
    area: string;
    componente: string;
    serie: string[];
    descricao: string;
}
