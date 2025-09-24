"use client";

import { createContext, useContext } from "react";
import { useSignUpModal } from "@/hooks/useSignUpModal";

interface SignUpModalContextType {
  isOpen: boolean;
  mode: "signup" | "signin";
  openModal: (mode?: "signup" | "signin") => void;
  closeModal: () => void;
}

const SignUpModalContext = createContext<SignUpModalContextType | undefined>(undefined);

export function SignUpModalProvider({ children }: { children: React.ReactNode }) {
  const signUpModal = useSignUpModal();

  return (
    <SignUpModalContext.Provider value={signUpModal}>
      {children}
    </SignUpModalContext.Provider>
  );
}

export function useSignUpModalContext() {
  const context = useContext(SignUpModalContext);
  if (context === undefined) {
    throw new Error("useSignUpModalContext must be used within a SignUpModalProvider");
  }
  return context;
}
