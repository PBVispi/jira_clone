

"use client";
import { type ReactNode, createContext, useContext } from "react";

type AuthModalContextProps = {
  authModalIsOpen: boolean;
  setAuthModalIsOpen: (open: boolean) => void;
};

// Modify the context to **never open the modal**
const AuthModalContext = createContext<AuthModalContextProps>({
  authModalIsOpen: false,
  setAuthModalIsOpen: () => {}, // Do nothing
});

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthModalContext.Provider
      value={{
        authModalIsOpen: false, // Always false
        setAuthModalIsOpen: () => {}, // Do nothing
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

// Hook to use this context (no modal behavior)
export const useAuthModalContext = () => useContext(AuthModalContext);