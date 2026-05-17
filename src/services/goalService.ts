import { writeBatch, doc, collection, serverTimestamp, getDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Goal } from "../types";

export const fetchEmployeeApprovedGoals = async (employeeId: string, fiscalYear: string): Promise<Goal[]> => {
  const sheetId = `${employeeId}_${fiscalYear}`;
  const sheetRef = doc(db, "goalSheets", sheetId);
  const sheetSnap = await getDoc(sheetRef);
  
  // If the sheet doesn't exist or isn't approved by a manager, return empty array
  if (!sheetSnap.exists() || sheetSnap.data().status !== 'approved') {
    return [];
  }
  
  const goalsRef = collection(db, `goalSheets/${sheetId}/goals`);
  const goalsSnap = await getDocs(goalsRef);
  
  const approvedGoals: Goal[] = [];
  goalsSnap.forEach((docSnap) => {
    const data = docSnap.data();
    approvedGoals.push({
      id: docSnap.id, // Real Firestore ID!
      thrustArea: data.thrustArea,
      title: data.title,
      description: data.description,
      unit: data.uom,
      target: data.target,
      weightage: data.weightage
    });
  });
  
  return approvedGoals;
};

export const submitGoalSheet = async (employeeId: string, fiscalYear: string, goals: Goal[]) => {
  const batch = writeBatch(db);
  const sheetId = `${employeeId}_${fiscalYear}`;
  
  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);

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

export const submitQuarterlyCheckin = async (employeeId: string, fiscalYear: string, quarter: string, actuals: Record<string, string | number>) => {
  const batch = writeBatch(db);
  const sheetId = `${employeeId}_${fiscalYear}`;

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
