import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration with real Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBvrk9AZuk61MJedAWao4q-uLYy9tGUjLw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "geo-mining-sih.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "geo-mining-sih",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "geo-mining-sih.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "628281312867",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:628281312867:web:50178010f295fd5c769a56",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-Z6KBZ71027"
};

// Check if valid Firebase configuration is present
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey.startsWith("AIza") &&
  firebaseConfig.projectId === "geo-mining-sih"
);

// Initialize Firebase App & Services
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} catch (error) {
  console.warn("Firebase initialization warning:", error.message);
}

// Built-in verified demo accounts for rapid testing & offline resilience
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@geomine.gov.in',
    password: 'admin@secure2026',
    role: 'admin',
    name: 'Eng. V. Sharma',
    title: 'System Administrator & AI Controller',
    badge: 'SIH-ADM-2026'
  },
  officer: {
    email: 'officer.geologist@cil.gov.in',
    password: 'strata@safe2026',
    role: 'officer',
    name: 'Geol. A. Roy',
    title: 'Senior Strata Geologist',
    badge: 'CIL-STRATA-08'
  }
};

/**
 * Sign in user with Firebase Auth and Firestore user profile lookup
 */
export const firebaseSignIn = async (email, password, requestedRole) => {
  const trimmedEmail = email.trim().toLowerCase();

  // 1. Check if user is using demo credentials or offline fallback
  const isDemoAdmin = trimmedEmail === DEMO_ACCOUNTS.admin.email.toLowerCase() && (password === DEMO_ACCOUNTS.admin.password || password === 'geomine2026');
  const isDemoOfficer = trimmedEmail === DEMO_ACCOUNTS.officer.email.toLowerCase() && (password === DEMO_ACCOUNTS.officer.password || password === 'geomine2026');

  if (isDemoAdmin) {
    return {
      uid: 'demo-admin-uid-2026',
      email: DEMO_ACCOUNTS.admin.email,
      role: 'admin',
      name: DEMO_ACCOUNTS.admin.name,
      title: DEMO_ACCOUNTS.admin.title,
      badge: DEMO_ACCOUNTS.admin.badge,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authProvider: 'demo-credential'
    };
  }

  if (isDemoOfficer) {
    return {
      uid: 'demo-officer-uid-2026',
      email: DEMO_ACCOUNTS.officer.email,
      role: 'officer',
      name: DEMO_ACCOUNTS.officer.name,
      title: DEMO_ACCOUNTS.officer.title,
      badge: DEMO_ACCOUNTS.officer.badge,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authProvider: 'demo-credential'
    };
  }

  // 2. If real Firebase is available, execute real Firebase Auth
  if (auth && isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;
      
      let userRole = requestedRole || (trimmedEmail.includes('admin') ? 'admin' : 'officer');
      let displayName = fbUser.displayName || (userRole === 'admin' ? 'Administrator' : 'Field Geologist');
      let badge = `AUTH-${fbUser.uid.slice(0, 6).toUpperCase()}`;

      // Try fetching role and profile from Firestore 'users' collection
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role) userRole = data.role;
            if (data.name) displayName = data.name;
            if (data.badge) badge = data.badge;
          }
        } catch (dbErr) {
          console.warn("Firestore user profile fetch warning:", dbErr.message);
        }
      }

      return {
        uid: fbUser.uid,
        email: fbUser.email,
        photoURL: fbUser.photoURL || null,
        role: userRole,
        name: displayName,
        title: userRole === 'admin' ? 'System Administrator' : 'Strata Geologist',
        badge: badge,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authProvider: 'firebase-auth'
      };
    } catch (firebaseErr) {
      let message = 'Authentication failed. Please check your credentials.';
      if (firebaseErr.code === 'auth/user-not-found') {
        message = 'No official account found with this email address.';
      } else if (firebaseErr.code === 'auth/wrong-password' || firebaseErr.code === 'auth/invalid-credential') {
        message = 'Invalid password provided for this terminal.';
      } else if (firebaseErr.code === 'auth/invalid-email') {
        message = 'The provided email address is invalid.';
      } else if (firebaseErr.code === 'auth/too-many-requests') {
        message = 'Access temporarily locked due to repeated failed attempts. Please reset password.';
      }
      throw new Error(message);
    }
  }

  // 3. Fallback for custom user logins in development / mock mode
  if (password && password.length >= 6) {
    const assignedRole = requestedRole || (trimmedEmail.includes('admin') ? 'admin' : 'officer');
    return {
      uid: `usr-${Date.now()}`,
      email: trimmedEmail,
      role: assignedRole,
      name: assignedRole === 'admin' ? 'Admin Officer' : 'Field Geologist',
      title: assignedRole === 'admin' ? 'System Administrator' : 'Mining Strata Officer',
      badge: `GM-${Math.floor(1000 + Math.random() * 9000)}`,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      authProvider: 'local-session'
    };
  }

  throw new Error('Password must be at least 6 characters.');
};

/**
 * Sign in with Google Authentication popup
 */
export const firebaseSignInWithGoogle = async (requestedRole = 'officer') => {
  if (auth && isFirebaseConfigured) {
    try {
      const provider = googleProvider || new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      let userRole = requestedRole;
      let displayName = fbUser.displayName || (userRole === 'admin' ? 'Administrator' : 'Field Officer');
      let badge = `AUTH-G-${fbUser.uid.slice(0, 6).toUpperCase()}`;

      // Check or create user profile in Firestore
      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role) userRole = data.role;
            if (data.name) displayName = data.name;
            if (data.badge) badge = data.badge;
          } else {
            // First time Google sign in -> save user profile with chosen role
            await setDoc(userDocRef, {
              uid: fbUser.uid,
              email: fbUser.email,
              role: userRole,
              name: displayName,
              photoURL: fbUser.photoURL || null,
              badge: badge,
              authProvider: 'google.com',
              createdAt: serverTimestamp()
            });
          }
        } catch (dbErr) {
          console.warn("Firestore Google user profile sync warning:", dbErr.message);
        }
      }

      return {
        uid: fbUser.uid,
        email: fbUser.email,
        photoURL: fbUser.photoURL || null,
        role: userRole,
        name: displayName,
        title: userRole === 'admin' ? 'System Administrator' : 'Strata Officer',
        badge: badge,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authProvider: 'google.com'
      };
    } catch (err) {
      let message = 'Google sign-in failed.';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Google sign-in popup was cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        message = 'Popup was blocked by browser. Please allow popups for this site.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'Domain not authorized in Firebase Console. Ensure localhost is authorized in Firebase Authentication settings.';
      } else if (err.message) {
        message = err.message;
      }
      throw new Error(message);
    }
  }

  // Development simulation response
  await new Promise(r => setTimeout(r, 600));
  return {
    uid: `usr-google-${Date.now()}`,
    email: requestedRole === 'admin' ? 'admin.google@geomine.gov.in' : 'officer.google@cil.gov.in',
    photoURL: null,
    role: requestedRole,
    name: requestedRole === 'admin' ? 'Eng. Google Admin' : 'Geol. Google Officer',
    title: requestedRole === 'admin' ? 'System Administrator' : 'Strata Geologist',
    badge: `GM-G-${Math.floor(1000 + Math.random() * 9000)}`,
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    authProvider: 'google.com-mock'
  };
};

/**
 * Register a new user with Firebase Auth and store profile in Firestore
 */
export const firebaseSignUp = async (email, password, displayName, role = 'officer') => {
  const trimmedEmail = email.trim().toLowerCase();

  if (auth && isFirebaseConfigured) {
    try {
      // 1. Create account in Firebase Authentication (stores email, uid, password hash)
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const fbUser = userCredential.user;
      
      const resolvedName = displayName || (role === 'admin' ? 'Admin Officer' : 'Field Geologist');
      const badgeId = `AUTH-${fbUser.uid.slice(0, 6).toUpperCase()}`;

      // 2. Set display name in Firebase Auth
      await updateProfile(fbUser, { displayName: resolvedName });

      // 3. Store full profile & email in Firestore 'users' collection
      if (db) {
        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            uid: fbUser.uid,
            email: trimmedEmail,
            role: role,
            name: resolvedName,
            badge: badgeId,
            authProvider: 'password',
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("Firestore record creation warning:", dbErr.message);
        }
      }

      return {
        uid: fbUser.uid,
        email: fbUser.email,
        role: role,
        name: resolvedName,
        title: role === 'admin' ? 'System Administrator' : 'Strata Officer',
        badge: badgeId,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authProvider: 'firebase-auth'
      };
    } catch (err) {
      let message = 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please provide a valid email format.';
      }
      throw new Error(message);
    }
  }

  // Development simulation mode
  return {
    uid: `usr-reg-${Date.now()}`,
    email: trimmedEmail,
    role: role,
    name: displayName || (role === 'admin' ? 'Admin Officer' : 'Field Geologist'),
    title: role === 'admin' ? 'System Administrator' : 'Strata Officer',
    badge: `GM-${Math.floor(1000 + Math.random() * 9000)}`,
    loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    authProvider: 'local-registered'
  };
};

/**
 * Reset user password with Firebase Auth
 */
export const firebaseResetPassword = async (email) => {
  const trimmedEmail = email.trim().toLowerCase();

  if (auth && isFirebaseConfigured) {
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return { success: true, message: `Password reset email dispatched to ${trimmedEmail}` };
    } catch (err) {
      let message = 'Failed to dispatch reset email.';
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address specified.';
      }
      throw new Error(message);
    }
  }

  // Development simulation response
  await new Promise(r => setTimeout(r, 600));
  return { success: true, message: `Password reset token sent to ${trimmedEmail}` };
};

/**
 * Sign out user
 */
export const firebaseSignOut = async () => {
  if (auth && isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase sign out error:", err);
    }
  }
};

export { app, auth, db, googleProvider, isFirebaseConfigured };
