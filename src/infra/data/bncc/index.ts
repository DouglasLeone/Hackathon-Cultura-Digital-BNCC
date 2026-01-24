import fundamentalData from './bncc_ensino_fundamental.json';
import medioData from './bncc_ensino_medio.json';

import { HabilidadeBNCC } from '../../../model/entities';

// Helper to ensure type safety when importing JSONs
const fundamental: HabilidadeBNCC[] = fundamentalData as unknown as HabilidadeBNCC[];
const medio: HabilidadeBNCC[] = medioData as unknown as HabilidadeBNCC[];

/**
 * Returns all BNCC data combined.
 */
export const getAllBnccData = (): HabilidadeBNCC[] => {
    return [...fundamental, ...medio];
};

/**
 * Returns BNCC data filtered by educational level.
 * @param nivel 'fundamental' or 'medio' (case insensitive partial match logic expected from caller, but strict here)
 */
export const getBnccByLevel = (nivel: 'fundamental' | 'medio'): HabilidadeBNCC[] => {
    if (nivel === 'fundamental') return fundamental;
    if (nivel === 'medio') return medio;
    return [];
};
