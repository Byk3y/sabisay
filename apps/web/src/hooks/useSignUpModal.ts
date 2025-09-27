'use client';

import { useState } from 'react';

export function useSignUpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');

  const openModal = (newMode: 'signup' | 'signin' = 'signup') => {
    console.log('openModal called with mode:', newMode);
    setMode(newMode);
    setIsOpen(true);
    console.log('Modal state set to open');
  };
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    mode,
    openModal,
    closeModal,
  };
}
