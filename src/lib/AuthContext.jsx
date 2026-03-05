import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, userService } from '@/api/firebaseClient';
import { auth } from '@/lib/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: 'ftc-hub' }); // Mock settings for Firebase

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setIsLoadingAuth(true);
      setAuthError(null);

      if (firebaseUser) {
        try {
          // Get or create user in Firestore
          let userData = await userService.getUser(firebaseUser.uid);

          if (!userData) {
            // Create new user
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              full_name: firebaseUser.displayName || firebaseUser.email,
              username: firebaseUser.displayName || firebaseUser.email.split('@')[0], // Default username
              role: 'user', // Default role
              createdAt: new Date(),
              updatedAt: new Date()
            };
            await userService.saveUser(userData);
          }

          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error loading user data:', error);
          setAuthError({
            type: 'user_data_error',
            message: 'Failed to load user data'
          });
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Don't set authError here - just show login page
      }

      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async (shouldRedirect = true) => {
    try {
      await authService.signOut();
      setUser(null);
      setIsAuthenticated(false);

      if (shouldRedirect) {
        // Redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    // Redirect to login page
    window.location.href = '/Login';
  };

  const refreshUser = async () => {
    // use authService helper if available
    const current = authService.getCurrentUser ? authService.getCurrentUser() : auth.currentUser;
    if (current) {
      try {
        const userData = await userService.getUser(current.uid);
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      setIsAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false, // No loading for Firebase
      authError,
      setAuthError,
      appPublicSettings,
      logout,
      navigateToLogin,
      refreshUser,
      checkAppState: () => {} // No-op for Firebase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
