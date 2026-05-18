import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../config/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile extends User {
  role?: 'employee' | 'manager' | 'admin';
  department?: string;
  designation?: string;
  phoneNumber?: string;
  salary?: string | number;
  name?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  role: 'employee' | 'manager' | 'admin' | null;
  loading: boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true, updateUserProfile: async () => {} });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'employee' | 'manager' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user role in Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setRole(data.role as 'employee' | 'manager' | 'admin');
          setUser({ ...firebaseUser, ...data } as UserProfile);
        } else {
          // First time login - default to employee with empty department to trigger onboarding
          const newUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'Unknown User',
            role: 'employee',
            department: '',
            createdAt: serverTimestamp()
          };
          await setDoc(userRef, newUserData);
          setRole('employee');
          setUser({ ...firebaseUser, ...newUserData } as UserProfile);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
    // Update local state immediately
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
