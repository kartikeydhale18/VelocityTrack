import { collection, query, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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

// Accept a shared task for a specific employee
export const acceptSharedTask = async (employeeId: string, task: SharedTask): Promise<void> => {
  const acceptedRef = doc(db, `users/${employeeId}/acceptedSharedTasks`, task.id);
  await addDoc(collection(db, `users/${employeeId}/acceptedSharedTasks`), {
    taskId: task.id,
    title: task.title,
    description: task.description,
    department: task.department,
    status: 'In Progress', // Default status when accepted
    acceptedAt: serverTimestamp()
  });
};

// Fetch accepted shared tasks for an employee
export const fetchAcceptedSharedTasks = async (employeeId: string): Promise<any[]> => {
  const q = query(collection(db, `users/${employeeId}/acceptedSharedTasks`));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Update the status of an accepted shared task
export const updateAcceptedTaskStatus = async (employeeId: string, acceptedTaskId: string, status: string): Promise<void> => {
  const docRef = doc(db, `users/${employeeId}/acceptedSharedTasks`, acceptedTaskId);
  // @ts-ignore
  await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
};
