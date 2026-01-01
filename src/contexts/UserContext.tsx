import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";
import { UserRole } from "../config/authRoles";
import { isAdminEmail } from "../constants/admin";

interface UserContextValue {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  role: "user",
  isAdmin: false,
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email?.toLowerCase() || "";
        const userIsAdmin = isAdminEmail(email);
        setUser(firebaseUser);
        setRole(userIsAdmin ? "admin" : "user");
      } else {
        setUser(null);
        setRole("user");
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = role === "admin";

  return (
    <UserContext.Provider value={{ user, role, isAdmin, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

// Alias for consistency - useUser and useAuth both work
export function useAuth() {
  return useUser();
}
