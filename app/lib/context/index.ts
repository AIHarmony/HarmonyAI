export { AppProvider, useAppContext } from './AppContext';
export { AuthProvider, useAuth } from './AuthContext';
export { SurveyProvider, useSurvey } from './SurveyContext';
export { WalletProvider, useWallet } from './WalletContext';

// Provider wrapper for all contexts
import React from 'react';
import { AppProvider } from './AppContext';
import { AuthProvider } from './AuthContext';
import { SurveyProvider } from './SurveyContext';
import { WalletProvider } from './WalletContext';

export const RootProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <AuthProvider>
        <WalletProvider>
          <SurveyProvider>
            {children}
          </SurveyProvider>
        </WalletProvider>
      </AuthProvider>
    </AppProvider>
  );
};
