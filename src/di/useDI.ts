
import { useContext } from 'react';
import { DIContext } from './DIContext';
import { IContainer } from './types';

export const useDI = (): IContainer => {
    const context = useContext(DIContext);
    if (!context) {
        throw new Error('useDI must be used within a DIProvider');
    }
    return context;
};
