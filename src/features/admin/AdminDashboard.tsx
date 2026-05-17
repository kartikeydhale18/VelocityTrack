import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Download, Activity, FileSpreadsheet, RefreshCcw, Users, Edit2, Save, Target, Unlock } from 'lucide-react';
import { fetchQuarterlyCompliance, exportPerformanceCSV, fetchAllUsers, updateUser, fetchApprovedSheets, revertSheetToDraft } from '../../services/adminService';
import type { UserProfile, Goal } from '../../types';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ totalActive: 0, totalCompleted: 0, complianceRate: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [approvedSheets, setApprovedSheets] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  const loadStats = async () => {
    setLoading(true);
    try {
      const [data, usersData, sheetsData] = await Promise.all([
        fetchQuarterlyCompliance(),
        fetchAllUsers(),
        fetchApprovedSheets()
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
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPerformanceCSV('FY26');
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
              FY26 Compliance Status
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
                  <h4 className="font-semibold text-slate-200">FY26 Performance Report</h4>
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

            <div className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 opacity-50 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-200">Audit Trail Logs</h4>
                  <p className="text-xs text-slate-500 mt-1">Requires full authentication system.</p>
                </div>
                <Button disabled variant="secondary">Locked</Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

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
                        />
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-slate-800 text-xs">{user.department || 'Unassigned'}</span>
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
                          onClick={() => { setEditingUser(user.uid); setEditForm({ role: user.role, department: user.department || '' }); }} 
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
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
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
                    onClick={async () => {
                      if(confirm("Revert this approved sheet back to Draft mode? The employee will be able to edit it again.")) {
                        await revertSheetToDraft(sheet.id);
                        setApprovedSheets(approvedSheets.filter(s => s.id !== sheet.id));
                      }
                    }}
                    className="gap-2 text-amber-400 hover:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                  >
                    <Unlock size={16} /> Unlock for Editing
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
