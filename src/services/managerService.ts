import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export interface PendingSheet {
  id: string;
  employeeId: string;
  fiscalYear: string;
  totalWeightage: number;
  goalCount: number;
  submittedAt: any;
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
      submittedAt: data.submittedAt
    });
  });
  
  return sheets;
};

export const approveGoalSheet = async (sheetId: string) => {
  const sheetRef = doc(db, "goalSheets", sheetId);
  await updateDoc(sheetRef, {
    status: "approved",
    approvedAt: serverTimestamp()
  });
};

export const rejectGoalSheet = async (sheetId: string) => {
  const sheetRef = doc(db, "goalSheets", sheetId);
  await updateDoc(sheetRef, {
    status: "rejected",
    rejectedAt: serverTimestamp()
  });
};
