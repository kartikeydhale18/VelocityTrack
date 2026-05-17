import { collection, query, where, getCountFromServer, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const fetchQuarterlyCompliance = async () => {
  const goalSheetsRef = collection(db, "goalSheets");
  
  // Query total active sheets for the current cycle
  const totalQuery = query(goalSheetsRef, where("fiscalYear", "==", "FY26"));
  const totalSnapshot = await getCountFromServer(totalQuery);
  const totalActive = totalSnapshot.data().count;
  
  // Query completed/approved sheets
  const completedQuery = query(
    goalSheetsRef, 
    where("fiscalYear", "==", "FY26"),
    where("status", "==", "pending_approval") // In MVP, anything submitted is pending_approval
  );
  const completedSnapshot = await getCountFromServer(completedQuery);
  const totalCompleted = completedSnapshot.data().count;
  
  return {
    totalActive: totalActive > 0 ? totalActive : 1, // Prevent division by zero if empty
    totalCompleted,
    complianceRate: totalActive > 0 ? Math.round((totalCompleted / totalActive) * 100) : 0
  };
};

export const exportPerformanceCSV = async (fiscalYear: string) => {
  const q = query(collection(db, "goalSheets"), where("fiscalYear", "==", fiscalYear));
  const querySnapshot = await getDocs(q);
  
  // We no longer need the 'data:text/csv' prefix because the Blob handles the file typing!
  let csvContent = "Goal Sheet ID,Employee ID,Manager ID,Status,Total Weightage,Goal Count\n";
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = [
      docSnap.id,
      data.employeeId || 'N/A',
      data.managerId || 'N/A',
      data.status || 'N/A',
      data.totalWeightage || 0,
      data.goalCount || 0
    ].join(",");
    csvContent += row + "\n";
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `Performance_Report_${fiscalYear}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  
  link.click();
  
  document.body.removeChild(link);
  
  // Delay revoking the URL to ensure the browser has time to read the 'download' attribute
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};

export const fetchAllUsers = async (): Promise<any[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
};

export const updateUser = async (uid: string, updates: any): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, updates);
};

export const fetchApprovedSheets = async (): Promise<any[]> => {
  const q = query(collection(db, 'goalSheets'), where('status', '==', 'approved'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const revertSheetToDraft = async (sheetId: string): Promise<void> => {
  const sheetRef = doc(db, 'goalSheets', sheetId);
  await updateDoc(sheetRef, {
    status: 'draft',
    managerNotes: 'Reverted to draft by HR/Admin for corrections.',
    updatedAt: new Date()
  });
};
