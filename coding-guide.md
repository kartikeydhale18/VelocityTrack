Coding & UI Guidelines
Tech Stack
Frontend: React.js + Vite (TypeScript)   

Styling: Tailwind CSS (Modern, clean slate/blue palette, accessible text, responsive dashboards)

Database & Auth: Firebase Modular JS SDK (v9+)

Folder Architecture
Enforce the modular folder structure. All components, hooks, and views must be grouped inside src/features/[feature_name] (e.g., auth, goals, checkins, reporting, admin).

Keep pure, highly reusable UI elements (Buttons, Inputs, Cards, Modals) in src/components/ui.  

Core Design Rules
Do NOT use heavy visual charts if they increase load times. Rely on clean Tailwind progress bars and status indicators.

Show instant client-side validation errors to employees pre-submission.  

Implement strict "Locked (Read-Only)" UI states when a goal sheet's status is 'approved'.