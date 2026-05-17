import { useState, useEffect } from 'react';
import GoalDashboard from './features/goals/GoalDashboard';
import CheckinDashboard from './features/checkins/CheckinDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import ManagerDashboard from './features/manager/ManagerDashboard';
import SharedTasksDashboard from './features/shared/SharedTasksDashboard';
import LoginScreen from './features/auth/LoginScreen';
import type { Goal } from './types';
import { Target, CalendarCheck, ShieldAlert, UserCheck, LogOut, Briefcase } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth, db } from './config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function AppContent() {
  const { user, role, loading } = useAuth();
  // Initialize state from localStorage if it exists
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('velocitytrack_draft_goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState<'goals' | 'checkin' | 'shared' | 'manager' | 'admin'>('goals');

  // Automatically save to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('velocitytrack_draft_goals', JSON.stringify(goals));
  }, [goals]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300 font-bold animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl animate-bounce">V</div>
          Loading secure environment...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* Top Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">V</div>
                VelocityTrack
              </div>
              
              <nav className="flex gap-1 ml-8">
                <button
                onClick={() => setActiveTab('goals')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'goals' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Target size={16} />
                Draft Goals
              </button>
              <button
                onClick={() => setActiveTab('checkin')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'checkin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CalendarCheck size={16} />
                Check-in
              </button>
              <button
                onClick={() => setActiveTab('shared')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'shared' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Briefcase size={16} />
                Shared Tasks
              </button>
              {(role === 'manager' || role === 'admin') && (
                <button
                  onClick={() => setActiveTab('manager')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'manager' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <UserCheck size={16} />
                  Manager Console
                </button>
              )}
              {role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldAlert size={16} />
                  Admin Console
                </button>
              )}
            </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-200">{user.displayName || user.email}</div>
                <div className="flex items-center gap-2 mt-0.5 justify-end">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded flex w-max">
                    Role: {role || 'employee'}
                  </div>
                  {role !== 'admin' && (
                    <button 
                      onClick={async () => {
                        await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
                        window.location.reload();
                      }}
                      className="text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      title="Hackathon Demo: Elevate to Admin"
                    >
                      [Demo] Make Admin
                    </button>
                  )}
                </div>
              </div>
              <button 
                onClick={() => auth.signOut()} 
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors p-2 rounded-full"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        {activeTab === 'goals' && <GoalDashboard goals={goals} setGoals={setGoals} />}
        {activeTab === 'checkin' && <CheckinDashboard />}
        {activeTab === 'shared' && <SharedTasksDashboard />}
        {activeTab === 'manager' && (role === 'manager' || role === 'admin') && <ManagerDashboard />}
        {activeTab === 'admin' && role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
