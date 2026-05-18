import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export interface PendingSheet {
  id: string;
  employeeId: string;
  fiscalYear: string;
  totalWeightage: number;
  goalCount: number;
  submittedAt: any;
  goals: any[];
}

export const fetchPendingSheets = async (): Promise<PendingSheet[]> => {
  const q = query(
    collection(db, "goalSheets"), 
    where("status", "==", "pending_approval")
  );
  
  const querySnapshot = await getDocs(q);
  const sheets: PendingSheet[] = [];
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    sheets.push({
      id: docSnap.id,
      employeeId: data.employeeId,
      fiscalYear: data.fiscalYear,
      totalWeightage: data.totalWeightage,
      goalCount: data.goalCount,
      submittedAt: data.submittedAt,
      goals: data.goals || []
    });
  });
  
  return sheets;
};

export const approveGoalSheet = async (sheetId: string, notes: string = ''): Promise<void> => {
  const sheetRef = doc(db, "goalSheets", sheetId);
  await updateDoc(sheetRef, {
    status: "approved",
    managerNotes: notes,
    updatedAt: new Date()
  });
};

export const rejectGoalSheet = async (sheetId: string, notes: string = ''): Promise<void> => {
  const sheetRef = doc(db, "goalSheets", sheetId);
  await updateDoc(sheetRef, {
    status: "rejected",
    managerNotes: notes,
    updatedAt: new Date()
  });
};
