import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Download, Activity, FileSpreadsheet, RefreshCcw, Users, Edit2, Save, Target, Unlock, X, CalendarClock } from 'lucide-react';
import { fetchQuarterlyCompliance, exportPerformanceCSV, fetchAllUsers, updateUser, fetchApprovedSheets, revertSheetToDraft, updateCycleConfig } from '../../services/adminService';
import { useCycle } from '../../context/CycleContext';
import type { UserProfile, Goal } from '../../types';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ totalActive: 0, totalCompleted: 0, complianceRate: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [approvedSheets, setApprovedSheets] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  // Review Modal State
  const [reviewSheet, setReviewSheet] = useState<any | null>(null);
  const [revertNotes, setRevertNotes] = useState('');
  const [isReverting, setIsReverting] = useState(false);

  // Cycle Context
  const { activeCycle } = useCycle();
  const [isSavingCycle, setIsSavingCycle] = useState(false);
  const [cycleForm, setCycleForm] = useState(activeCycle);

  // Sync local form when global context updates
  useEffect(() => {
    setCycleForm(activeCycle);
  }, [activeCycle]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [data, usersData, sheetsData] = await Promise.all([
        fetchQuarterlyCompliance(activeCycle.fiscalYear),
        fetchAllUsers(),
        fetchApprovedSheets(activeCycle.fiscalYear)
      ]);
      setStats(data);
      setUsers(usersData as UserProfile[]);
      setApprovedSheets(sheetsData);
    } catch (error) {
      console.error("Failed to load compliance stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeCycle.fiscalYear]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPerformanceCSV(activeCycle.fiscalYear);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export CSV data. Check console for details.");
    } finally {
      setExporting(false);
    }
  };

  const handleSaveUser = async (uid: string) => {
    try {
      await updateUser(uid, editForm);
      setUsers(users.map(u => u.uid === uid ? { ...u, ...editForm } : u));
      setEditingUser(null);
    } catch (e) {
      console.error("Failed to update user", e);
      alert("Failed to update user details.");
    }
  };

  const handleRevert = async () => {
    if (!reviewSheet) return;
    setIsReverting(true);
    try {
      await revertSheetToDraft(reviewSheet.id, revertNotes);
      setApprovedSheets(approvedSheets.filter(s => s.id !== reviewSheet.id));
      setReviewSheet(null);
      setRevertNotes('');
    } catch (e) {
      console.error("Failed to revert", e);
      alert("Failed to revert sheet.");
    } finally {
      setIsReverting(false);
    }
  };

  const handleSaveCycle = async () => {
    setIsSavingCycle(true);
    try {
      await updateCycleConfig(cycleForm);
    } catch (e) {
      console.error("Failed to update cycle", e);
      alert("Failed to update cycle configuration.");
    } finally {
      setIsSavingCycle(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
            <ShieldAlert size={28} className="text-purple-400" />
            Admin Governance Console
          </h1>
          <p className="text-slate-400 mt-1">Real-time organizational compliance and reporting.</p>
        </div>
        <Button variant="secondary" onClick={loadStats} disabled={loading} className="gap-2">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Compliance Stats Card */}
        <Card className="border-purple-500/20 bg-slate-900/60 shadow-lg shadow-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={20} className="text-purple-400" />
              {activeCycle.fiscalYear} Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="currentColor" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={88 * 2 * Math.PI} 
                    strokeDashoffset={88 * 2 * Math.PI - (stats.complianceRate / 100) * 88 * 2 * Math.PI}
                    className="text-purple-500 transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-white">{stats.complianceRate}%</span>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Completed</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Total Active Sheets</div>
                <div className="text-2xl font-bold text-slate-200">{stats.totalActive}</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Submitted Sheets</div>
                <div className="text-2xl font-bold text-emerald-400">{stats.totalCompleted}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export & Governance Card */}
        <Card className="border-pink-500/20 bg-slate-900/60 shadow-lg shadow-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-pink-400" />
              Data Exporters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate full organizational performance reports. These reports are compiled securely within your browser using zero-cost client-side processing to protect Firebase quota limits.
            </p>
            
            <div className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">{activeCycle.fiscalYear} Performance Report</h4>
                  <p className="text-xs text-slate-500 mt-1">Includes all finalized metrics and raw scores.</p>
                </div>
                <Button 
                  onClick={handleExport} 
                  disabled={exporting}
                  className="bg-pink-600 hover:bg-pink-500 text-white gap-2"
                >
                  <Download size={16} />
                  {exporting ? 'Generating...' : 'Export CSV'}
                </Button>
              </div>
            </div>



          </CardContent>
        </Card>
      </div>

      {/* Global Cycle Management Card */}
      <Card className="border-amber-500/20 bg-slate-900/60 shadow-lg shadow-amber-500/5 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock size={20} className="text-amber-400" />
            Global Cycle Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Active Fiscal Year</label>
              <input 
                type="text" 
                value={cycleForm.fiscalYear} 
                onChange={(e) => setCycleForm({...cycleForm, fiscalYear: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Active Check-in Quarter</label>
              <select 
                value={cycleForm.activeQuarter}
                onChange={(e) => setCycleForm({...cycleForm, activeQuarter: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="q1">Q1 (Apr - Jun)</option>
                <option value="q2">Q2 (Jul - Sep)</option>
                <option value="q3">Q3 (Oct - Dec)</option>
                <option value="q4">Q4 (Jan - Mar)</option>
              </select>
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-slate-400 mb-2">Goal Setting Phase</label>
              <button 
                onClick={() => setCycleForm({...cycleForm, isGoalSettingOpen: !cycleForm.isGoalSettingOpen})}
                className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors ${
                  cycleForm.isGoalSettingOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {cycleForm.isGoalSettingOpen ? 'Unlocked (Open)' : 'Locked (Closed)'}
              </button>
            </div>

            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-slate-400 mb-2">Quarterly Check-in Phase</label>
              <button 
                onClick={() => setCycleForm({...cycleForm, isCheckinOpen: !cycleForm.isCheckinOpen})}
                className={`w-full py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors ${
                  cycleForm.isCheckinOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}
              >
                {cycleForm.isCheckinOpen ? 'Unlocked (Open)' : 'Locked (Closed)'}
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
            <Button 
              onClick={handleSaveCycle} 
              disabled={isSavingCycle}
              className="bg-amber-600 hover:bg-amber-500 text-white gap-2"
            >
              <Save size={16} /> {isSavingCycle ? 'Saving...' : 'Save Cycle Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* HR User Management Card */}
      <Card className="border-blue-500/20 bg-slate-900/60 shadow-lg shadow-blue-500/5 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} className="text-blue-400" />
            User & Role Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="p-4 rounded-tl-xl font-medium">Employee Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Department</th>
                  <th className="p-4 font-medium">Designation</th>
                  <th className="p-4 font-medium">Phone / Salary</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 rounded-tr-xl font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.uid} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4 text-slate-500">{user.email}</td>
                    <td className="p-4">
                      {editingUser === user.uid ? (
                        <input 
                          type="text" 
                          value={editForm.department || ''} 
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-32"
                          placeholder="Dept"
                        />
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-slate-800 text-xs">{user.department || 'Unassigned'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUser === user.uid ? (
                        <input 
                          type="text" 
                          value={editForm.designation || ''} 
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-32"
                          placeholder="Designation"
                        />
                      ) : (
                        <span className="text-slate-300">{user.designation || '-'}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUser === user.uid ? (
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            value={editForm.phoneNumber || ''} 
                            onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-32"
                            placeholder="Phone"
                          />
                          <input 
                            type="text" 
                            value={editForm.salary || ''} 
                            onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500 w-32"
                            placeholder="Salary"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col text-xs text-slate-400">
                          <span>{user.phoneNumber || '-'}</span>
                          <span>{user.salary ? `$${user.salary}` : '-'}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {editingUser === user.uid ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="admin">HR / Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                          user.role === 'manager' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editingUser === user.uid ? (
                        <Button size="sm" onClick={() => handleSaveUser(user.uid)} className="gap-2 bg-emerald-600 hover:bg-emerald-500">
                          <Save size={14} /> Save
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => { setEditingUser(user.uid); setEditForm({ role: user.role, department: user.department || '', designation: user.designation, phoneNumber: user.phoneNumber, salary: user.salary }); }} 
                          className="gap-2 text-blue-400 hover:text-blue-300"
                        >
                          <Edit2 size={14} /> Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Approved Goals Governance */}
      <Card className="border-emerald-500/20 bg-slate-900/60 shadow-lg shadow-emerald-500/5 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} className="text-emerald-400" />
            Approved Goal Sheets Governance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedSheets.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No approved goal sheets found.</div>
            ) : (
              approvedSheets.map(sheet => (
                <div key={sheet.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-200">Employee: <span className="text-emerald-400">
                      {users.find(u => u.uid === sheet.employeeId)?.name || sheet.employeeId}
                    </span></h4>
                    <p className="text-sm text-slate-400 mt-1">{sheet.fiscalYear} • {sheet.goalCount} Goals • {sheet.totalWeightage}% Weightage</p>
                  </div>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setReviewSheet(sheet);
                      setRevertNotes('');
                    }}
                    className="gap-2 text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Unlock size={16} /> Review & Unlock
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border-slate-700 shadow-2xl">
            <CardHeader className="border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Target size={20} /> Review Goal Sheet Before Reverting
              </CardTitle>
              <button onClick={() => setReviewSheet(null)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </CardHeader>
            <CardContent className="overflow-y-auto p-6 flex-1 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewSheet.goals?.map((goal: Goal) => (
                  <div key={goal.id} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                        {goal.thrustArea}
                      </span>
                      <span className="text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        {goal.weightage}% Weight
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-200 mb-1 leading-snug">{goal.title}</h4>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{goal.description}</p>
                    <div className="text-xs text-slate-500 border-t border-slate-700/50 pt-2">
                      Target: <span className="text-blue-400 font-bold">{goal.target} {goal.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="block text-sm font-medium text-slate-300">Revert Reason / Notes (Visible to Employee)</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500 min-h-[100px]"
                  placeholder="Explain what needs to be fixed..."
                  value={revertNotes}
                  onChange={e => setRevertNotes(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <Button variant="secondary" onClick={() => setReviewSheet(null)}>Cancel</Button>
                <Button 
                  onClick={handleRevert} 
                  disabled={isReverting || !revertNotes}
                  className="bg-amber-600 hover:bg-amber-500 text-white gap-2"
                >
                  <Unlock size={16} /> {isReverting ? 'Reverting...' : 'Revert to Draft'}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
