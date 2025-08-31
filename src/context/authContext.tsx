"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

// Define the shape of the data in our context
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  // ✅ CHANGED: The login function is now simpler
  login: (redirectPath: string) => Promise<void>; 
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    // We don't want to set loading to true every time, 
    // especially during a silent re-check on login.
    // We only need the initial loading screen.
    // setIsLoading(true); // This can be removed if you only want initial load blocking.

    try {
      const response = await axios.get('/api/check/me');
      const userData = response.data.data;

      if (userData?.userType) {
        console.log("usedType and isVerified from token: ", userData.userType, userData.isVerified);
        if(userData.userType === 'seller' && !userData.isVerified){
          setIsAuthenticated(false);
          setRole(null);
          return;
        }
        setIsAuthenticated(true);
        setRole(userData.userType);
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    } catch (_error: unknown) {
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed here

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // ✅ NEW: The login function now re-validates auth and then navigates
  const login = useCallback(async (redirectPath: string) => {
    // First, re-run the check to get the latest user data from the new token
    await checkAuthStatus();
    toast.success("Login successful!");
    // NOW navigate, after the state has been updated
    router.push(redirectPath);
  }, [checkAuthStatus, router]); // Add dependencies

  const logout = useCallback(async () => {
    try {
      await axios.get('/api/auth/logout');
      toast.success("Logout successful");
    } catch (error: unknown) {
      if (error instanceof Error) {
          toast.error(error.message);
      } else {
          toast.error("An unknown error occurred during logout.");
      }
    } finally {
      setIsAuthenticated(false);
      setRole(null);
      router.push("/login");
    }
  }, [router]); // Add router dependency

  const value = { isAuthenticated, role, login, logout, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {/* Show a loading screen or nothing until the initial auth check is done */}
      {isLoading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};