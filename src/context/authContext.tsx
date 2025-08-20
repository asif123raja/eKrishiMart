// "use client";
// import { createContext, useContext, useState, useEffect } from "react";
// import { useRouter } from "next/navigation";  // Import router
// import axios from "axios";
// import toast from "react-hot-toast";

// interface AuthContextType {
//     isAuthenticated: boolean;
//     role: string | null;
//     login: (role: string) => void;
//     logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [role, setRole] = useState<string | null>(null);
//     const router = useRouter(); // Initialize router

//     useEffect(() => {
//         const checkAuth = async () => {
//             try {
//                 const [res1, res2] = await Promise.allSettled([
//                     axios.get('/api/check/me2'),
//                     axios.get('/api/check/me')
//                 ]);

//                 let userRole = null;
//                 console.log("Response 1:", res1);
//                 console.log("Response 2:",res2);

//                 if (res1.status === "fulfilled" && res1.value.data?.data?.role) {
//                     userRole = res1.value.data.data.role;
//                     console.log("user role 1:", userRole);
//                 } else if (res2.status === "fulfilled" && res2.value.data?.data?.role) {
//                     userRole = res2.value.data.data.role;
//                     console.log("user role 2:", userRole);
//                 }

//                 if (userRole) {
//                     setIsAuthenticated(true);
//                     setRole(userRole);
//                 }
//             } catch (error) {
//                 setIsAuthenticated(false);
//                 setRole(null);
//             }
//         };

//         checkAuth();
//     }, []);

//     const login = (userRole: string) => {
//         setIsAuthenticated(true);
//         setRole(userRole);
//     };

//     const logout =async () => {
//         await axios.get('/api/auth/logout');
//         toast.success("Logout successful");
//         setIsAuthenticated(false);
//         setRole(null);
//         localStorage.removeItem("token");
//         router.push("/login");  // Redirect to login
//     };

//     return (
//         <AuthContext.Provider value={{ isAuthenticated, role, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };

// "use client";

// import { createContext, useContext, useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import toast from "react-hot-toast";

// // Define the shape of the data in our context
// interface AuthContextType {
//   isAuthenticated: boolean;
//   role: string | null;
//   login: (data: { userType: string; redirectPath: string }) => void;
//   logout: () => void;
//   isLoading: boolean; // ✅ NEW: Add a loading state
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [role, setRole] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true); // Start in a loading state
//   const router = useRouter();

//   // ✅ NEW: Simplified function to check authentication status
//   const checkAuthStatus = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       // We only need one endpoint to get the current user's data
//       const response = await axios.get('/api/check/me');
//       const userData = response.data.data;

//       if (userData?.userType) {
//         setIsAuthenticated(true);
//         // This must provide 'buyer', 'seller', or 'manager' for the Header
//         setRole(userData.userType); 
//       } else {
//         setIsAuthenticated(false);
//         setRole(null);
//       }
//     } catch (error) {
//       setIsAuthenticated(false);
//       setRole(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     checkAuthStatus();
//   }, [checkAuthStatus]);

//   // ✅ NEW: More robust login function that also handles the redirect
//   const login = (data: { userType: string; redirectPath: string }) => {
//     setIsAuthenticated(true);
//     setRole(data.userType);
//     toast.success("Login successful!");
//     router.push(data.redirectPath); // The context now handles the redirect
//   };
//   console.log("role and isAuthenticated", { role, isAuthenticated})
//   const logout = async () => {
//     try {
//       await axios.get('/api/users/logout'); // Use a consistent API path
//       toast.success("Logout successful");
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setIsAuthenticated(false);
//       setRole(null);
//       router.push("/login");
//     }
//   };

//   const value = { isAuthenticated, role, login, logout, isLoading };

//   return (
//     <AuthContext.Provider value={value}>
//       {!isLoading && children} {/* Optionally, don't render children until auth check is done */}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };
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
        setIsAuthenticated(true);
        setRole(userData.userType);
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setRole(null);
    } finally {
      setIsLoading(false); // Ensure this is always set to false after the check
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
      await axios.get('/api/users/logout');
      toast.success("Logout successful");
    } catch (error: any) {
      toast.error(error.message);
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