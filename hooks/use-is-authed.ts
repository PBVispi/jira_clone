"use client";
import { useAuthModalContext } from "@/context/use-auth-modal";
import { useUser } from "@clerk/clerk-react";

/*export const useIsAuthenticated = (): [string | undefined, () => void] => {
/ const { user } = useUser();
  const { setAuthModalIsOpen } = useAuthModalContext();

  function openAuthModal() {
    setAuthModalIsOpen(true);
  }

  return [user?.id, openAuthModal];
};*/

export const useIsAuthenticated = (): [string | undefined, () => void] => {
  const user = { id: "test-user" }; // Mocked user (always authenticated)

  function openAuthModal() {
    console.log("Auth modal bypassed");
  }

  return [user.id, openAuthModal];
};
