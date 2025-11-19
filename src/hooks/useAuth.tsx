/// <reference types="vite/client" />
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

interface AuthError {
  message: string;
}

interface AuthResponse {
  data: {
    token: string;
    user: User;
    expiresAt: number;
  } | null;
  error: AuthError | null;
}

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Setup axios interceptor untuk menambahkan token ke setiap request
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Check existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("auth_token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const expiresAt = parseInt(localStorage.getItem("token_expires") || "0");

          // Check if token is expired
          if (Date.now() > expiresAt) {
            // Token expired, clear storage
            clearAuthStorage();
            setUser(null);
            setSession(null);
          } else {
            // Verify token with backend
            const response = await axios.get(`${API_URL}/auth/verify`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.valid) {
              setUser(userData);
              setSession({
                user: userData,
                token,
                expiresAt,
              });
            } else {
              // Invalid token
              clearAuthStorage();
              setUser(null);
              setSession(null);
            }
          }
        } catch (error) {
          console.error("Session check error:", error);
          clearAuthStorage();
          setUser(null);
          setSession(null);
        }
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expires");
  };

  const saveAuthData = (token: string, user: User, expiresAt: number) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token_expires", expiresAt.toString());
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        full_name: fullName,
      });

      if (response.data.token) {
        const { token, user, expiresAt } = response.data;

        // Save to localStorage
        saveAuthData(token, user, expiresAt);

        setUser(user);
        setSession({ user, token, expiresAt });

        return { data: response.data, error: null };
      }

      return { data: null, error: { message: "Signup failed" } };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.response?.data?.message || "Signup failed",
        },
      };
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      });

      if (response.data.token) {
        const { token, user, expiresAt } = response.data;

        // Save to localStorage
        saveAuthData(token, user, expiresAt);

        setUser(user);
        setSession({ user, token, expiresAt });

        return { data: response.data, error: null };
      }

      return { data: null, error: { message: "Signin failed" } };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.response?.data?.message || "Signin failed",
        },
      };
    }
  };

  const signInWithGoogle = async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, {
        credential,
      });

      if (response.data.token) {
        const { token, user, expiresAt } = response.data;

        // Save to localStorage
        saveAuthData(token, user, expiresAt);

        setUser(user);
        setSession({ user, token, expiresAt });

        return { data: response.data, error: null };
      }

      return { data: null, error: { message: "Google signin failed" } };
    } catch (error: any) {
      return {
        data: null,
        error: {
          message: error.response?.data?.message || "Google signin failed",
        },
      };
    }
  };

  const signOut = async () => {
    try {
      await axios.post(`${API_URL}/auth/signout`);
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      // Clear storage
      clearAuthStorage();

      setUser(null);
      setSession(null);
      navigate("/auth");
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};