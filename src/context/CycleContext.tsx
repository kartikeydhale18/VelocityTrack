import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface CycleConfig {
  fiscalYear: string;
  activeQuarter: string;
  isGoalSettingOpen: boolean;
  isCheckinOpen: boolean;
}

const DEFAULT_CYCLE: CycleConfig = {
  fiscalYear: 'FY26',
  activeQuarter: 'q1',
  isGoalSettingOpen: true,
  isCheckinOpen: true
};

interface CycleContextType {
  activeCycle: CycleConfig;
  loading: boolean;
}

const CycleContext = createContext<CycleContextType>({ activeCycle: DEFAULT_CYCLE, loading: true });

export const useCycle = () => useContext(CycleContext);

export const CycleProvider = ({ children }: { children: ReactNode }) => {
  const [activeCycle, setActiveCycle] = useState<CycleConfig>(DEFAULT_CYCLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'system_config', 'activeCycle');
    
    const unsubscribe = onSnapshot(docRef, async (snap) => {
      if (snap.exists()) {
        setActiveCycle(snap.data() as CycleConfig);
        setLoading(false);
      } else {
        // Document doesn't exist, create it with the default values
        try {
          await setDoc(docRef, DEFAULT_CYCLE);
          setActiveCycle(DEFAULT_CYCLE);
        } catch (e) {
          console.error("Failed to initialize cycle config", e);
        }
        setLoading(false);
      }
    }, (err) => {
      console.error("Cycle listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <CycleContext.Provider value={{ activeCycle, loading }}>
      {children}
    </CycleContext.Provider>
  );
};
