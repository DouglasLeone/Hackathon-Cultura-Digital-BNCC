import { useMemo } from 'react';

/**
 * Hook para gerenciar o ID único do usuário.
 * Sistema single-user: ID é gerado uma vez e armazenado no localStorage.
 * 
 * @returns {string} User ID persistente
 */
export const useUserId = (): string => {
    return useMemo(() => {
        let id = localStorage.getItem('user_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('user_id', id);
        }
        return id;
    }, []);
};
