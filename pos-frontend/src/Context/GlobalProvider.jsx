import React, {
    createContext,
    useContext,
} from 'react';
import useGlobal from '../Hooks/useGlobal';
import useLocalUser from '@/feature/Users/Hooks/useLocalUser';

const globalContext = createContext();

export function GlobalProvider({ children }) {
    return (
        <globalContext.Provider value={{ ...useGlobal(), ...useLocalUser() }}>
            {children}
        </globalContext.Provider>
    );
}

export const useGlobalCtx = () => useContext(globalContext);
