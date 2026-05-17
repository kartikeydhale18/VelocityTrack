# VelocityTrack

**VelocityTrack** is a secure, high-performance web application designed for organizational performance tracking, quarterly check-ins, and automated compliance reporting.

## Features

- **Phase 1: Goal Drafting**
  - Employees can draft and submit strict organizational goals.
  - Enforced 8-goal limit, 10% minimum weightage per goal, and total 100% weightage validation.
- **Phase 2: Check-ins**
  - Live progress tracking with auto-calculating actual vs. target completion percentages.
  - Strict temporal lock-out based on fiscal quarter months.
- **Phase 3: Manager Console**
  - Approvals and rejections for employee-submitted goal sheets.
  - **New:** Managers can attach detailed feedback/notes directly to approved or rejected sheets.
- **Phase 4: Admin & HR Console**
  - Real-time aggregated organizational compliance metrics.
  - Client-side, zero-cost `.csv` data exporters for performance reports.
  - **New:** HR User Management to dynamically assign Departments and Roles (`employee`, `manager`, `admin`).
  - **New:** HR Governance dashboard to instantly unlock/revert Approved Goal Sheets back to Draft status for corrections.
- **Phase 5: Global Organization features**
  - **New:** Shared Tasks Network allowing HR/Managers to broadcast tasks to specific departments or the entire globe.
  - **New:** Private "My Approved Goals" Vault hidden securely for employees to review finalized expectations.
- **Security & Deployment**
  - Firebase Authentication (Google Sign-In).
  - Strict Role-Based Access Control (RBAC).
  - Deployed globally on Firebase Hosting.

## Live Demo
🌐 **[VelocityTrack Live Site](https://velocitytrack-3e491.web.app)**

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, custom glassmorphism components
- **Database & Auth:** Firebase Firestore, Firebase Authentication
- **Icons:** Lucide React

## Getting Started

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up a Firebase project and add your web app credentials to `.env.local`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Managing Roles (RBAC)
By default, new users logging in via Google are assigned the `employee` role.
To unlock Manager or Admin functionality for the first time, navigate to your Firebase Console -> Firestore Database -> `users` collection -> edit the `role` field on your user document to `"admin"`. 
Once you are an admin, you can manage all other users' roles directly from the **Admin Console** UI inside the app!