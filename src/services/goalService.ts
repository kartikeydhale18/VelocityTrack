import { writeBatch, doc, collection, serverTimestamp, getDocs, query, where, orderBy, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Goal } from "../types";

export const fetchAllEmployeeGoalSheets = async (employeeId: string, fiscalYear: string) => {
  const q = query(
    collection(db, "goalSheets"),
    where("employeeId", "==" , employeeId),
    where("fiscalYear", "==", fiscalYear),
    orderBy("submittedAt", "desc")
  );
  
  const snap = await getDocs(q);
  const sheets = [];
  
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    
    // Fetch goals subcollection
    const goalsRef = collection(db, `goalSheets/${docSnap.id}/goals`);
    const goalsSnap = await getDocs(goalsRef);
    const goalsData = goalsSnap.docs.map(g => ({ id: g.id, ...g.data() }));

    sheets.push({
      id: docSnap.id,
      status: data.status,
      managerNotes: data.managerNotes || '',
      submittedAt: data.submittedAt,
      goals: goalsData
    });
  }
  
  return sheets;
};

export const fetchActiveApprovedSheet = async (employeeId: string, fiscalYear: string) => {
  const q = query(
    collection(db, "goalSheets"),
    where("employeeId", "==" , employeeId),
    where("fiscalYear", "==", fiscalYear),
    where("status", "==", "approved")
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return null;
  
  // Assuming there's only ever one approved sheet, pick the first
  const docSnap = snap.docs[0];
  const data = docSnap.data();
  
  const goalsRef = collection(db, `goalSheets/${docSnap.id}/goals`);
  const goalsSnap = await getDocs(goalsRef);
  const goalsData = goalsSnap.docs.map(g => ({ id: g.id, ...g.data() }));
  
  return {
    id: docSnap.id,
    status: data.status,
    managerNotes: data.managerNotes || '',
    goals: goalsData
  };
};

export const submitGoalSheet = async (employeeId: string, fiscalYear: string, goals: Goal[]) => {
  const batch = writeBatch(db);
  const sheetId = `${employeeId}_${fiscalYear}_${Date.now()}`;
  
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);

  // 0. Archive any existing pending sheets so they don't pile up in the manager queue
  const existingPendingQ = query(
    collection(db, "goalSheets"),
    where("employeeId", "==", employeeId),
    where("fiscalYear", "==", fiscalYear),
    where("status", "==", "pending_approval")
  );
  const pendingSnap = await getDocs(existingPendingQ);
  pendingSnap.forEach(docSnap => {
    batch.update(docSnap.ref, { status: 'superseded' });
  });

  // 1. Create the parent goal sheet document
  const sheetRef = doc(db, "goalSheets", sheetId);
  batch.set(sheetRef, {
    employeeId,
    managerId: "manager_placeholder", // Hardcoded until Auth is integrated
    fiscalYear,
    status: "pending_approval",
    totalWeightage,
    goalCount: goals.length,
    submittedAt: serverTimestamp(),
    approvedAt: null
  });

  // 2. Add each goal to the subcollection
  goals.forEach((goal) => {
    // Generate a new document reference in the goals subcollection
    const goalRef = doc(collection(db, `goalSheets/${sheetId}/goals`));
    batch.set(goalRef, {
      thrustArea: goal.thrustArea,
      title: goal.title,
      description: goal.description,
      uom: goal.unit,
      target: goal.target,
      weightage: goal.weightage,
      isShared: false,
      parentGoalId: null,
      achievements: {}
    });
  });

  // Commit the atomic transaction
  await batch.commit();
};

export const submitQuarterlyCheckin = async (sheetId: string, quarter: string, actuals: Record<string, string | number>) => {
  const batch = writeBatch(db);

  // In a real scenario, we would query the existing goals from the subcollection.
  // Since we only have the local state Goal array (which has our locally generated IDs),
  // we are simulating the update. If we had real Firestore IDs, we would update them like so:
  
  Object.entries(actuals).forEach(([localGoalId, actualValue]) => {
    // Note: Since our local goals don't have true Firestore IDs yet (they were created locally in Phase 1),
    // this is a mock implementation. In a full app, we would fetch the exact Firestore document IDs first.
    // For demonstration, we'll pretend the localGoalId IS the Firestore ID.
    const goalRef = doc(db, `goalSheets/${sheetId}/goals`, localGoalId);
    
    // We use set with merge: true to avoid overwriting other quarters if they existed
    batch.set(goalRef, {
      achievements: {
        [quarter]: {
          actual: actualValue,
          status: "Logged",
          timestamp: serverTimestamp()
        }
      }
    }, { merge: true });
  });

  await batch.commit();
};
