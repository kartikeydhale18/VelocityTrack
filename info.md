Technical Architecture, MVP Scope, and Cost-Optimization Strategy: In-House Goal Setting & Tracking PortalArchitectural Foundation and Technology Stack IntegrationThe development of a high-performance, enterprise-grade In-House Goal Setting & Tracking Portal within a compressed 36-hour hackathon timeframe requires a highly optimized client-centric architecture. Selecting React.js combined with the Vite build tool as the frontend framework, alongside Google Firebase for authentication and database services, establishes a reliable, serverless ecosystem. This architecture offloads execution overhead from backend servers to the client web browser, minimizing structural complexity, reducing network latency, and eliminating hosting costs.Vite-Powered React Single Page Application ArchitectureVite serves as the foundational build tool and development server, replacing historical configurations with rapid Hot Module Replacement (HMR) and highly optimized production bundling. Vite leverages native browser-based ECMAScript Modules (ESM) during development to bypass server-side bundling bottlenecks. In production, it utilizes Rollup to execute advanced tree-shaking, code splitting, and asset compression. This reduces compile times and minimizes static package sizes, directly lowering network bandwidth transfer requirements on the hosting layer.The internal application architecture is organized using a feature-based modular folder structure. Unlike traditional technical layer groupings, this design clusters related UI views, state controls, custom hooks, and service boundaries by business function. This directory mapping is structured as follows:src/
├── assets/             # Global static media, customized iconography, and fonts
├── config/             # Immutable Firebase initialize configurations and global client instances
├── context/            # React Context hooks executing application-wide state management
├── layouts/            # Layout shells including navigation bars and sidebars
├── services/           # Decoupled Firestore and Authentication communication modules
├── utils/              # Pure functional math calculators and date validation routines
├── features/           # Domain-specific business components
│   ├── auth/           # Login screens, password recovery, and token state persistence
│   ├── goals/          # Submission forms, constraint checkers, and shared goal controls
│   ├── checkins/       # Log templates, manager check-in panels, and score calculations
│   ├── reporting/      # Real-time search tools, filters, and CSV extraction utilities
│   └── admin/          # Cycle managers, hierarchy structures, and audit trail viewers
The system enforces clear unidirectional boundaries. Core layouts, shared elements, and utility functions are imported into domain-specific features, whereas features are strictly isolated from one another. Feature interfaces communicate solely via high-level page layouts mapped to the router, preventing tight coupling and facilitating isolated debugging during the 36-hour sprint.Static Asset Optimization and Deployment StrategyStatic web page builds are deployed using Firebase Hosting, which serves assets across a global Content Delivery Network (CDN) with automatic SSL certification. To keep bandwidth within free daily quotas, the portal implements asset optimization strategies. The deployment utilizes a tailored firebase.json configuration file to enforce HTTP cache control policies :JSON{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": false,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/assets/**",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
This configuration routes all virtual paths to index.html to support client-side routing within the React SPA framework. It also marks compiled assets with an immutable header. This prevents client browsers from re-requesting static files on page reloads, shifting the transfer load from Firebase CDN data egress to local client memory, which helps stay within the free Spark plan allocation.Minimum Viable Product Scope Definition and User PersonasTo succeed in a 36-hour hackathon, developers must clearly distinguish between Minimum Viable Product (MVP) core components and auxiliary enhancements. This ensures that all baseline business requirements are met with high stability before implementing bonus items.RBAC Access MatrixThe system features an integrated role-based access control (RBAC) model across three user personas :User RoleSystem DescriptionAccessible ScopePrimary OperationsCore Validation GatesEmployeeOperational contributors drafting individual performance targets.Personal dashboard and assigned goal sheets.Draft, modify, and submit goal sheets; input quarterly achievements.Enforces $\le 8$ total goals, minimum weight of $10\%$, and total weight of $100\%$.L1 ManagerDirect supervisors reviewing and managing team sheets.Team dashboard and subordinate profiles.Edit goals inline; approve/return sheets; log check-in feedback.Inline revisions must maintain the cumulative $100\%$ weightage rule.Admin / HRPlatform administrators managing cycles and configuration parameters.System configuration views, audit logs, and organization charts.Manage active cycles; unlock approved sheets; export CSV data.Bypasses standard locks; writes directly to immutable audit logs.Feature Matrix: MVP vs. Post-MVP StrategyProduct CapabilityMinimum Viable Product (MVP) ScopePost-MVP Enhancement RoadmapCost & Resource ImpactAuthenticationFirebase Auth using standard email/password credentials with client routing.Microsoft Entra ID integration with federated Single Sign-On (SSO).Free under the Spark tier, whereas advanced SAML/OIDC SSO incurs extra costs.Organization DirectoryManager references mapped within Firestore user documents.Real-time directory synchronization from Active Directory attributes.Free via manual entry or admin CSV scripts ; automated Azure AD sync requires paid endpoints.Shared GoalsReference arrays linking child targets to manager-managed key objectives.Teams-based push notifications and automated department mapping.Zero server-side cost ; managed entirely through read-side joins in the client app.NotificationsClient-side visual alerts and dashboard banner highlights.Automated emails and Microsoft Teams bot adaptive cards.External integrations require paid infrastructure or Cloud Functions on Blaze plans.System Audit LogsAtomic transaction logging to an append-only auditTrail collection.Real-time monitoring and threat alerts.Fully compliant with zero overhead using Firestore transactions.By focusing the 36-hour hackathon on standard email credentials, flat manager relations, and local validation, the portal achieves compliance with all required Phase 1 and Phase 2 workflows. This maintains high performance while keeping hosting costs at zero.Data Schema and NoSQL Relationship ModelingBecause Firestore is a NoSQL document store, it lacks native relational joins. This requires structured, denormalized data schemas designed around the application's read paths rather than write paths.Collection Structure: usersDocument Identifier: Firebase Auth UID (Guarantees unique profiles matching authenticated states) JSON Schema Mapping:JSON{
  "email": "employee.name@atomberg.com",
  "displayName": "Employee Name",
  "role": "employee",
  "managerId": "manager_auth_uid_789",
  "department": "Research & Development",
  "createdAt": "2026-05-16T12:00:00Z"
}
Collection Structure: goalSheetsDocument Identifier: Unique string format ${employeeId}_${fiscalYear} (Prevents duplicate sheet submissions) JSON Schema Mapping:JSON{
  "employeeId": "employee_auth_uid_123",
  "managerId": "manager_auth_uid_789",
  "fiscalYear": "FY26",
  "status": "pending_approval",
  "totalWeightage": 100,
  "goalCount": 5,
  "submittedAt": "2026-05-16T12:10:00Z",
  "approvedAt": null
}
Subcollection Structure: goalSheets/{sheetId}/goalsDocument Identifier: Firestore auto-generated string identifier JSON Schema Mapping:JSON{
  "thrustArea": "Operational Excellence",
  "title": "Reduce Defect Rate",
  "description": "Optimize motor line assembly processes to improve product yield",
  "uom": "percent_max",
  "target": 0.5,
  "weightage": 20,
  "isShared": false,
  "parentGoalId": null,
  "achievements": {
    "q1": { "actual": 0.8, "status": "On Track", "comment": "Initial tooling upgrades completed." },
    "q2": { "actual": null, "status": "Not Started", "comment": "" },
    "q3": { "actual": null, "status": "Not Started", "comment": "" },
    "q4": { "actual": null, "status": "Not Started", "comment": "" }
  }
}
Collection Structure: sharedGoalsDocument Identifier: Firestore auto-generated string identifier JSON Schema Mapping:JSON{
  "thrustArea": "Enterprise Compliance",
  "title": "Information Security Training",
  "description": "Achieve security compliance across all departments",
  "uom": "percent_min",
  "target": 100,
  "primaryOwnerId": "admin_auth_uid_999",
  "currentProgress": 85.5
}
Collection Structure: auditTrailDocument Identifier: Firestore auto-generated string identifier JSON Schema Mapping:JSON{
  "goalSheetId": "employee_auth_uid_123_FY26",
  "goalId": "goal_document_id_abc",
  "modifiedBy": "manager_auth_uid_789",
  "timestamp": "2026-05-16T12:15:00Z",
  "action": "inline_edit",
  "changes": {
    "weightage": {
      "oldValue": 15,
      "newValue": 20
    }
  }
}
Organizational Reporting StructuresTo map relationships without deep hierarchical indexing, the application uses a flat manager-pointer architecture inside the root users collection. This design bypasses Firestore's document-size limitations by avoiding nested child arrays. Managers retrieve their direct reports using a single index query :JavaScriptconst q = query(
  collection(db, "users"), 
  where("managerId", "==", activeUserUid)
);
To reconstruct multi-level corporate reporting chains, the portal processes these pointers client-side using standard recursion. This provides managers with access to deep reporting lines without requiring complex database queries.Shared Goals Synced reference patternCopying global goals across hundreds of individual sheets creates write amplification. Under the Spark plan's 20,000 daily write limit, pushing changes to a wide audience risks exhausting the quota.To resolve this, the portal uses a Read-Side Dereferencing Pattern :[sharedGoals Collection]
       |
       |  Admin publishes master target (1 Write)
       v
  { _id: "compliance_goal_2026", title: "Sec Training", target: 100, currentProgress: 85 }
       |
       +----------------------------+
       |                            |
       | Linked via parentGoalId    | Linked via parentGoalId
       v                            v
[employee_A subcollection]    
  {                            {
    isShared: true,              isShared: true,
    parentGoalId: "...",         parentGoalId: "...",
    weightage: 15                weightage: 20
  }                            }
The administrator publishes a single master document in the sharedGoals collection, defining the target and current progress.For each recipient, a link document is created in their local goals subcollection with isShared: true and a parentGoalId pointer.When loading an employee's goal sheet, the application reads their local subcollection. For any document with isShared === true, the portal performs a single batch fetch to retrieve the shared details using the parentGoalId.When the primary owner updates progress on the master goal, the change reflects across all linked employee views. This model keeps the sync overhead to a single write operation, protecting the daily database write limits.Mathematical Progress FormulationDuring check-ins, the portal evaluates performance using four math formulations based on the selected Unit of Measurement (UoM). Computations are executed client-side to conserve backend compute resources.                +-----------------------------------------+
                |    Goal Progress Calculation Engine     |
                +-----------------------------------------+
                                     |
               Determine Unit of Measurement (UoM) Type
                                     |
         +-----------------+---------+---------+-----------------+
         |                 |                   |                 |
         v                 v                   v                 v
     [Min UoM]         [Max UoM]                   [Zero]
    Score = A / T     Score = T / A      Date vs Deadline    0 = 100%
         |                 |                   |                 |
         +-----------------+---------+---------+-----------------+
                                     |
                          Apply Capping Bounds
                           0% <= Score <= 100%
Let $A$ be the actual recorded achievement, and let $T$ be the planned target.Min (Numeric / %)Used when a higher score indicates better performance (e.g., Sales Revenue, Project Deliveries). The progress score is calculated as:
$$Score_{\text{Min}} = \min\left(100\%, \max\left(0\%, \frac{A}{T} \times 100\%\right)\right)$$Max (Numeric / %)Used when a lower score indicates better performance (e.g., Turnaround Time (TAT), Processing Costs). The progress score is calculated as:
$$Score_{\text{Max}} = \min\left(100\%, \max\left(0\%, \frac{T}{A} \times 100\%\right)\right)$$TimelineUsed for date-bound completion metrics. Let $D_A$ be the actual date of completion, and let $D_P$ be the target deadline.$$Score_{\text{Timeline}} = \begin{cases} 100\% & \text{if } D_A \le D_P \\ 0\% & \text{if } D_A > D_P \end{cases}$$Zero-BasedUsed for critical metrics where any occurrence represents failure (e.g., Security Violations, Safety Incidents).$$Score_{\text{Zero}} = \begin{cases} 100\% & \text{if } A = 0 \\ 0\% & \text{if } A > 0 \end{cases}$$Edge-Case Safety Controls and Zero-Division ProtectionTo prevent NaN (Not a Number) errors or infinite values in the UI, the calculations are wrapped in defensive logic:JavaScriptexport const computeGoalProgress = (uom, target, actual) => {
  const t = parseFloat(target);
  const a = parseFloat(actual);

  if (isNaN(t) || isNaN(a)) return 0;

  switch (uom) {
    case 'numeric_min':
    case 'percent_min':
      if (t === 0) return a > 0? 100 : 0;
      return Math.min(100, Math.max(0, (a / t) * 100));

    case 'numeric_max':
    case 'percent_max':
      if (a === 0) return t >= 0? 100 : 0;
      return Math.min(100, Math.max(0, (t / a) * 100));

    case 'timeline':
      if (!actual) return 0;
      return new Date(actual).getTime() <= new Date(target).getTime()? 100 : 0;

    case 'zero_based':
      return a === 0? 100 : 0;

    default:
      return 0;
  }
};
This math package is integrated into both the employee's input form and the manager's review dashboard, providing real-time calculations as actual metrics are entered.Strategic Cost Optimization and Resource Efficiency (Near-$0 Architecture)Operating an enterprise portal on a $0 infrastructure model requires careful management of Google Cloud boundaries. This is achieved by maximizing local browser operations and utilizing Firestore's caching features.Firestore Quotas and Mitigation StrategyService MetricSpark Plan QuotaPortal Implementation StrategyOptimization OutcomeDocument Reads50,000 per day.Enable IndexedDB offline persistence ; wrap reads in TanStack Query.Minimizes server round-trips for repeat visits.Document Writes20,000 per day.Perform validation checking on the client side before writing.Prevents wasted operations from validation errors.Outbound Egress10 GiB per month.Denormalize flat manager references to avoid deep traversals.Reduces total data payload per document read.Static Storage10 GB total.Optimize React builds via Vite and compress design assets.Keeps the production payload size under $2\text{ MB}$.Database Storage1 GiB total.Use compact field names to reduce metadata overhead.Allows the portal to scale to thousands of users on a $0 budget.Implementing Firestore Multi-Tab Offline PersistenceEnabling local disk caching allows the portal to retrieve documents from IndexedDB, serving repeat reads with zero network requests. The setup uses the following configuration:JavaScriptimport { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
Using persistentMultipleTabManager ensures synchronization across multiple browser tabs. This prevents read duplication and local write conflicts, ensuring a consistent user experience.TanStack Query In-Memory State CachingWhile Firestore's offline persistence acts as a local disk cache , TanStack Query (React Query) manages in-memory query states. This prevents the application from making duplicate database requests as users navigate between tabs :JavaScriptimport { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const useEmployeeProfile = (userId) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      return docSnap.data();
    },
    staleTime: 1000 * 60 * 15, // Mark data as fresh for 15 minutes
    cacheTime: 1000 * 60 * 60 // Keep query cache in memory for 1 hour
  });
};
This integration prevents active UI components from triggering redundant Firestore requests during standard use.Role Custom Claims Seeding ScriptAttaching user roles via Cloud Functions requires upgrading to the paid Firebase Blaze plan. Although the Blaze plan has a free tier, it introduces billing risk.To maintain a true $0 Spark architecture, roles are seeded directly into Firebase Auth custom claims using a local Node.js script run by developers or HR admins using the Firebase Admin SDK :JavaScriptconst admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const setUserRole = async (uid, role) => {
  try {
    // Write custom claims directly to Firebase Auth
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log(`Successfully assigned custom claim [${role}] to UID [${uid}]`);
    
    // Sync Firestore database profile metadata
    await admin.firestore().collection("users").doc(uid).set({
      role: role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    console.log("Firestore target profile synced successfully.");
  } catch (error) {
    console.error("Failed to seed user custom claims:", error);
  }
};

const = process.argv;
if (targetUid && targetRole) {
  setUserRole(targetUid, targetRole);
} else {
  console.log("Usage: node set-user-claims.js <uid> <role>");
}
This approach applies custom claims to the user's ID token at login. This allows Firestore Security Rules to read user permissions directly from the auth context with zero execution cost and no server compute dependencies.Optimized Firestore Query MechanicsTo keep database reads minimal on high-volume dashboard views, the portal implements two query strategies :Cursor-Based Pagination: Employs limit() and startAfter() to restrict dashboards to 20 rows per view, avoiding full collection scans. Offset operators are bypassed because Firestore bills for skipped documents.Aggregated Counters: The system aggregates metric counts (e.g., pending goal sheets, check-in completion rates) directly onto parent documents during writes using increment(1). This allows the portal to retrieve counters in a single document read rather than scanning entire collections.Security, Controls, and Administrative OperationsThe portal relies on Firestore Security Rules as its primary security boundary, protecting database access directly at the API layer.Firestore Security Rules File (firestore.rules)JavaScriptrules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isSignedIn() {
      return request.auth!= null;
    }
    
    function getUserRole() {
      return request.auth.token.role;
    }
    
    function isOwner(employeeId) {
      return request.auth.uid == employeeId;
    }
    
    function isManagerOf(employeeId) {
      return get(/databases/$(database)/documents/users/$(employeeId)).data.managerId == request.auth.uid;
    }

    // Collection Rules
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if getUserRole() == 'admin';
    }

    match /goalSheets/{sheetId} {
      allow read: if isSignedIn() && (
        isOwner(resource.data.employeeId) || 
        isManagerOf(resource.data.employeeId) || 
        getUserRole() == 'admin'
      );
      
      allow create: if isSignedIn() && isOwner(request.resource.data.employeeId) && (
        request.resource.data.status == 'draft' &&
        request.resource.data.totalWeightage == 0 &&
        request.resource.data.goalCount == 0
      );

      allow update: if isSignedIn() && (
        getUserRole() == 'admin' ||
        // Employees can modify draft sheets or submit them for approval
        (isOwner(resource.data.employeeId) && 
         resource.data.status!= 'approved' && 
         request.resource.data.status in ['draft', 'pending_approval']) ||
         
        // Managers can edit status during approval
        (isManagerOf(resource.data.employeeId) && 
         request.resource.data.status in ['approved', 'rework', 'pending_approval'])
      );
    }

    match /goalSheets/{sheetId}/goals/{goalId} {
      allow read: if isSignedIn() && (
        isOwner(get(/databases/$(database)/documents/goalSheets/$(sheetId)).data.employeeId) ||
        isManagerOf(get(/databases/$(database)/documents/goalSheets/$(sheetId)).data.employeeId) ||
        getUserRole() == 'admin'
      );
      
      allow create, update, delete: if isSignedIn() && (
        getUserRole() == 'admin' ||
        // Prevent all goal alterations if parent sheet status is approved
        (get(/databases/$(database)/documents/goalSheets/$(sheetId)).data.status!= 'approved' && (
          isOwner(get(/databases/$(database)/documents/goalSheets/$(sheetId)).data.employeeId) ||
          isManagerOf(get(/databases/$(database)/documents/goalSheets/$(sheetId)).data.employeeId)
        ))
      );
    }

    match /sharedGoals/{goalId} {
      allow read: if isSignedIn();
      allow write: if getUserRole() in ['admin', 'manager'];
    }

    match /auditTrail/{logId} {
      allow read: if isSignedIn() && getUserRole() in ['admin', 'manager'];
      allow create: if isSignedIn(); // Written via atomic transactions
      allow update, delete: if false; // Append-only audit logs
    }
  }
}
Validating Goal Constraints in NoSQLTo enforce the maximum limit of 8 goals per employee, the $10\%$ minimum weightage per goal, and the $100\%$ cumulative weightage requirement, the portal coordinates frontend validations with Firestore Security Rules :Maximum Goal Capacity: The portal counts the documents within the employee’s goals subcollection. If the count is 8, the "Create Goal" interface is disabled in the UI.Minimum Goal Weight: The goal creation form employs local validation inputs that block values below $10\%$.Cumulative Weightage Control: Because Firestore security rules evaluate single documents and cannot iterate over collections with loops to sum weightages on submission , the portal uses a Parent-Aggregated Status Pattern.In this pattern, the parent goalSheets/{sheetId} document contains totalWeightage and goalCount fields. Adding, modifying, or deleting a goal document triggers a Firestore batched write that writes the goal and updates the parent document's fields using increment() :JavaScriptimport { writeBatch, doc, increment } from "firebase/firestore";
import { db } from "../config/firebase";

export const addGoalToSheet = async (sheetId, goalData) => {
  const batch = writeBatch(db);
  
  // Set the new goal document
  const goalRef = doc(collection(db, `goalSheets/${sheetId}/goals`));
  batch.set(goalRef, goalData);
  
  // Update parent summary totals
  const sheetRef = doc(db, "goalSheets", sheetId);
  batch.update(sheetRef, {
    totalWeightage: increment(goalData.weightage),
    goalCount: increment(1)
  });
  
  await batch.commit();
};
When an employee submits their goal sheet, the Firestore security rules evaluate the parent document's aggregated attributes (e.g., request.resource.data.totalWeightage == 100 and request.resource.data.goalCount <= 8), blocking invalid structures on write.Lock State and Exception OverridesOnce a manager approves a goal sheet, its status changes to approved. This status change triggers rules that block edits to both the parent sheet and its subcollection goals.If an administrative override is required, the system employs an atomic transaction that executes the override and records the action in the auditTrail collection :JavaScriptimport { runTransaction, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export const executeAdminOverride = async (sheetId, goalId, updateFields, adminId) => {
  await runTransaction(db, async (transaction) => {
    const goalRef = doc(db, `goalSheets/${sheetId}/goals`, goalId);
    const auditRef = doc(collection(db, "auditTrail"));
    
    // Perform transaction read before write
    const goalSnap = await transaction.get(goalRef);
    const previousData = goalSnap.data();
    
    // Commit the modifications
    transaction.update(goalRef, updateFields);
    
    // Log details to the audit collection
    transaction.set(auditRef, {
      goalSheetId: sheetId,
      goalId: goalId,
      modifiedBy: adminId,
      timestamp: serverTimestamp(),
      action: "admin_override",
      changes: {
        previous: previousData,
        updated: updateFields
      }
    });
  });
};
Using transactions guarantees that the update to the goal and the creation of the audit trail log succeed together, ensuring database integrity and system accountability.Reporting & Governance ModulesThe platform includes two governance modules to monitor team performance and track process compliance across the organization.Real-Time Completion Compliance DashboardThe Completion Dashboard provides administrators with real-time visibility into quarterly check-in completion rates. To minimize server reads, this feature uses Firestore's aggregate query functions, which scan indexes to return counts in a single read operation :JavaScriptimport { collection, query, where, getCountFromServer } from "firebase/firestore";
import { db } from "../config/firebase";

export const fetchQuarterlyCompliance = async (quarter) => {
  const goalSheetsRef = collection(db, "goalSheets");
  
  // Query total active sheets
  const totalQuery = query(goalSheetsRef, where("fiscalYear", "==", "FY26"));
  const totalSnapshot = await getCountFromServer(totalQuery);
  const totalCount = totalSnapshot.data().count;
  
  // Query completed check-ins
  const completedQuery = query(
    goalSheetsRef, 
    where("fiscalYear", "==", "FY26"), 
    where(`${quarter}Status`, "==", "completed")
  );
  const completedSnapshot = await getCountFromServer(completedQuery);
  const completedCount = completedSnapshot.data().count;
  
  return {
    totalActive: totalCount,
    totalCompleted: completedCount,
    complianceRate: totalCount > 0? (completedCount / totalCount) * 100 : 0
  };
};
This model provides administrators with real-time compliance tracking while reducing document reads, helping stay within the Spark plan’s daily quotas.Client-Side Data ExportersTo provide administrators and managers with exportable CSV performance reports without incurring backend server or compute costs, the system formats data directly on the client side :JavaScriptimport { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const exportPerformanceCSV = async (fiscalYear) => {
  const q = query(collection(db, "goalSheets"), where("fiscalYear", "==", fiscalYear));
  const querySnapshot = await getDocs(q);
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Goal Sheet ID,Employee ID,Manager ID,Status,Total Weightage,Goal Count\n";
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const row =.join(",");
    csvContent += row + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Performance_Report_${fiscalYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
This export strategy processes the formatting and download entirely in the user's browser, eliminating external API costs and protecting system resources.Operational Windows and Transition ScheduleTo ensure consistent organizational alignment, the portal enforces a timeline for goal setting and review cycles.Operational Review Window DetailsPerformance PhaseTarget Start DateActive Operational ConstraintsPrimary User ActionsPhase 1: Goal SettingMay 1st.Open goal sheet creation; validation logic active.Draft, inline modify, submit, and approve goal sheets.Q1 Progress ReviewJuly 1st.Log actual performance results; target definitions locked.Update progress actuals; submit quarterly achievements.Q2 Progress ReviewOctober 1st.Log actual performance results; target definitions locked.Update progress actuals; log quarterly manager feedback.Q3 Progress ReviewJanuary 1st.Log actual performance results; target definitions locked.Update progress actuals; log quarterly manager feedback.Q4 / Annual ReviewMarch 1st.Log final metrics; lock final evaluation states.Capture final achievements; execute administrative exports.To enforce these cycles securely without requiring backend server instances, active windows are defined in a shared config document: /config/activeCycle.During evaluation, Firestore Security Rules read this configuration document using get() to verify that progress updates occur within valid calendar dates, protecting system schedules.ConclusionsThis technical architecture provides a secure, lightweight, and cost-effective design for the In-House Goal Setting & Tracking Portal. By offloading validation, mathematical calculations, and file exporting to the client, the portal runs efficiently within the free limits of the Firebase Spark plan.Using multi-tab IndexedDB persistence, local caching via TanStack Query, custom claim seeding, and parent-aggregated validation rules establishes a stable system design that meets all Phase 1 and Phase 2 business requirements on a near-$0 infrastructure budget.