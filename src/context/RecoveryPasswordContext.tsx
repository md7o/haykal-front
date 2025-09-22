"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface RecoveryPasswordContextType {
  email: string;
  setEmail: (email: string) => void;
  clearEmail: () => void;
  code: string;
  setCode: (code: string) => void;
  clearCode: () => void;
}

const RecoveryPasswordContext = createContext<RecoveryPasswordContextType | undefined>(undefined);

export const RecoveryPasswordProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  // Restore from sessionStorage on mount (client only)
  useEffect(() => {
    try {
      const storedEmail = sessionStorage.getItem("recovery.email");
      if (storedEmail) setEmail(storedEmail);
      const storedCode = sessionStorage.getItem("recovery.code");
      if (storedCode) setCode(storedCode);
    } catch {}
  }, []);

  // Persist email to sessionStorage
  useEffect(() => {
    try {
      if (email) sessionStorage.setItem("recovery.email", email);
      else sessionStorage.removeItem("recovery.email");
    } catch {}
  }, [email]);

  // Persist code to sessionStorage
  useEffect(() => {
    try {
      if (code) sessionStorage.setItem("recovery.code", code);
      else sessionStorage.removeItem("recovery.code");
    } catch {}
  }, [code]);

  const clearEmail = () => setEmail("");
  const clearCode = () => setCode("");
  return (
    <RecoveryPasswordContext.Provider value={{ email, setEmail, clearEmail, code, setCode, clearCode }}>
      {children}
    </RecoveryPasswordContext.Provider>
  );
};

export const useRecoveryPassword = () => {
  const context = useContext(RecoveryPasswordContext);
  if (!context) throw new Error("useRecoveryPassword must be used within RecoveryPasswordProvider");
  return context;
};
