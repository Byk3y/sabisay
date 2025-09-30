'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidePanelContextType {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  openSidePanel: () => void;
  closeSidePanel: () => void;
}

const SidePanelContext = createContext<SidePanelContextType | undefined>(
  undefined
);

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const openSidePanel = () => setIsSidePanelOpen(true);
  const closeSidePanel = () => setIsSidePanelOpen(false);

  return (
    <SidePanelContext.Provider
      value={{
        isSidePanelOpen,
        setIsSidePanelOpen,
        openSidePanel,
        closeSidePanel,
      }}
    >
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const context = useContext(SidePanelContext);
  if (context === undefined) {
    throw new Error('useSidePanel must be used within a SidePanelProvider');
  }
  return context;
}
