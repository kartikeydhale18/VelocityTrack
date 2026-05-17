import { collection, query, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { SharedTask } from '../types';

export const fetchSharedTasks = async (): Promise<SharedTask[]> => {
  const q = query(collection(db, 'sharedTasks'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedTask));
};

export const createSharedTask = async (task: Omit<SharedTask, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, 'sharedTasks'), {
    ...task,
    createdAt: serverTimestamp()
  });
};

export const deleteSharedTask = async (taskId: string): Promise<void> => {
  await deleteDoc(doc(db, 'sharedTasks', taskId));
};
