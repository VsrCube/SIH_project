import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  firebaseSignIn, 
  firebaseSignUp, 
  firebaseSignInWithGoogle,
  firebaseResetPassword, 
  firebaseSignOut, 
  auth, 
  isFirebaseConfigured,
  DEMO_ACCOUNTS 
} from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthRoleContext = createContext();

export const AuthRoleProvider = ({ children }) => {
  // Login selection state (for water-bubble role slider on login page)
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem('geo_mine_selected_role') || 'admin';
  });
  const [slideDirection, setSlideDirection] = useState('to-left');

  // Authenticated user state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('geo_mine_auth_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Synchronize Firebase auth state change if live Firebase is active
  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser(prev => {
            const role = prev?.role || localStorage.getItem('geo_mine_user_role') || 'officer';
            const updatedUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              photoURL: fbUser.photoURL || null,
              role: role,
              name: fbUser.displayName || (role === 'admin' ? 'Administrator' : 'Field Geologist'),
              title: role === 'admin' ? 'System Administrator' : 'Strata Geologist',
              badge: `AUTH-${fbUser.uid.slice(0, 6).toUpperCase()}`,
              loginTime: prev?.loginTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              authProvider: fbUser.providerData?.[0]?.providerId || 'firebase-auth'
            };
            localStorage.setItem('geo_mine_auth_user', JSON.stringify(updatedUser));
            return updatedUser;
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const switchSelectedRole = (newRole) => {
    if (newRole === selectedRole) return;
    if (newRole === 'officer') {
      setSlideDirection('to-right');
    } else {
      setSlideDirection('to-left');
    }
    setSelectedRole(newRole);
    localStorage.setItem('geo_mine_selected_role', newRole);
  };

  /**
   * Login with Email & Password
   */
  const login = async (email, password, role) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const targetRole = role || selectedRole;
      const authenticatedUser = await firebaseSignIn(email, password, targetRole);
      
      setUser(authenticatedUser);
      localStorage.setItem('geo_mine_auth_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('geo_mine_user_role', targetRole);
      setAuthLoading(false);
      return authenticatedUser;
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Login / Sign Up with Google Popup
   */
  const loginWithGoogle = async (role) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const targetRole = role || selectedRole;
      const googleUser = await firebaseSignInWithGoogle(targetRole);

      setUser(googleUser);
      localStorage.setItem('geo_mine_auth_user', JSON.stringify(googleUser));
      localStorage.setItem('geo_mine_user_role', targetRole);
      setAuthLoading(false);
      return googleUser;
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Register with Email, Password & Name
   */
  const register = async (email, password, displayName, role) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const targetRole = role || selectedRole;
      const registeredUser = await firebaseSignUp(email, password, displayName, targetRole);
      
      setUser(registeredUser);
      localStorage.setItem('geo_mine_auth_user', JSON.stringify(registeredUser));
      localStorage.setItem('geo_mine_user_role', targetRole);
      setAuthLoading(false);
      return registeredUser;
    } catch (err) {
      setAuthLoading(false);
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * Request password reset via Firebase
   */
  const resetPassword = async (email) => {
    return await firebaseResetPassword(email);
  };

  /**
   * Sign out and clear stored session
   */
  const logout = async () => {
    await firebaseSignOut();
    setUser(null);
    localStorage.removeItem('geo_mine_auth_user');
    localStorage.removeItem('geo_mine_user_role');
  };

  const isAdminSelected = selectedRole === 'admin';
  const isOfficerSelected = selectedRole === 'officer';

  return (
    <AuthRoleContext.Provider
      value={{
        selectedRole,
        slideDirection,
        switchSelectedRole,
        isAdminSelected,
        isOfficerSelected,
        user,
        login,
        loginWithGoogle,
        register,
        resetPassword,
        logout,
        isAuthenticated: Boolean(user),
        authLoading,
        authError,
        setAuthError,
        demoAccounts: DEMO_ACCOUNTS
      }}
    >
      {children}
    </AuthRoleContext.Provider>
  );
};

export const useAuthRole = () => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};

export const useRoleTheme = useAuthRole;
export const RoleThemeProvider = AuthRoleProvider;
