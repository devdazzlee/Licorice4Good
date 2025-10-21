"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { clearAuthCookies } from "@/utils/cookieUtils";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  requiresVerification?: boolean;
  // add other fields as needed
};

interface MeResponse {
  user: User;
}

// Cache for user data to reduce API calls
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Global function to clear user cache (call this after login/logout)
export function clearUserCache() {
  userCache = null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<number>(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUser = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && userCache && (now - userCache.timestamp) < CACHE_DURATION) {
      setUser(userCache.user);
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous requests
    if (now - lastFetchRef.current < 5000) { // 5 second cooldown
      return;
    }

    lastFetchRef.current = now;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    try {
      const res = await axios.get<MeResponse>(`${API_URL}/auth/me`, {
        withCredentials: true,
      });
      
      const userData = res.data.user;
      setUser(userData);
      setError(null);
      
      // Update cache
      userCache = { user: userData, timestamp: now };
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 'status' in err.response &&
          err.response.status === 429) {
        // Rate limited - set error and schedule retry
        setError('We\'re experiencing high traffic. Please wait a moment and try again.');
        
        // Clear any existing retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
        
        // Retry after 30 seconds
        retryTimeoutRef.current = setTimeout(() => {
          setError(null);
          fetchUser(true);
        }, 30000);
      } else {
        // If auth fails (401/403), clear invalid cookies
        if (axios.isAxiosError(err) && err.response && 
            (err.response.status === 401 || err.response.status === 403)) {
          console.log('Auth failed - clearing invalid cookies');
          clearAuthCookies();
          userCache = null;
        }
        setUser(null);
        setError(null);
      }
    }
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    setError(null);
    // Clear cache to force fresh data
    userCache = null;
    await fetchUser(true);
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    setLoading(false);
    setError(null);
    userCache = null;
    
    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    fetchUser().finally(() => {
      setLoading(false);
    });
    
    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [fetchUser]);

  return { user, loading, error, refreshUser, clearUser };
}
