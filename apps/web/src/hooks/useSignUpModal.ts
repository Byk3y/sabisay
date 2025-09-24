"use client";

import { useState } from "react";

export function useSignUpModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signup" | "signin">("signup");

  const openModal = (newMode: "signup" | "signin" = "signup") => {
    setMode(newMode);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  return {
    isOpen,
    mode,
    openModal,
    closeModal,
  };
}
