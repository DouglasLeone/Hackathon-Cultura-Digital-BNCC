
import React, { createContext, ReactNode } from 'react';
import { IContainer } from './types';

export const DIContext = createContext<IContainer | null>(null);

interface DIProviderProps {
    container: IContainer;
    children: ReactNode;
}

export const DIProvider: React.FC<DIProviderProps> = ({ container, children }) => {
    return (
        <DIContext.Provider value={container}>
            {children}
        </DIContext.Provider>
    );
};
