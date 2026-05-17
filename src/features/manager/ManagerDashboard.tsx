import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { CheckCircle, Clock, AlertTriangle, UserCheck, XCircle, MessageSquare } from 'lucide-react';
import { fetchPendingSheets, approveGoalSheet, rejectGoalSheet, type PendingSheet } from '../../services/managerService';
import { fetchAllUsers } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import type { UserProfile } from '../../types';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [pendingSheets, setPendingSheets] = useState<PendingSheet[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const loadPendingSheets = async () => {
    setLoading(true);
    try {
      const [sheets, usersData] = await Promise.all([
        fetchPendingSheets(),
        fetchAllUsers()
      ]);
      setPendingSheets(sheets);
      setUsers(usersData as UserProfile[]);
    } catch (error) {
      console.error("Failed to load pending sheets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingSheets();
  }, []);

  const handleApprove = async (sheetId: string) => {
    setProcessingId(sheetId);
    try {
      await approveGoalSheet(sheetId, notes[sheetId] || '');
      // Remove the approved sheet from the local list
      setPendingSheets(current => current.filter(s => s.id !== sheetId));
    } catch (error) {
      console.error("Failed to approve sheet:", error);
      alert("Failed to approve sheet. Check console.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (sheetId: string) => {
    setProcessingId(sheetId + "_reject");
    try {
      await rejectGoalSheet(sheetId, notes[sheetId] || '');
      // Remove the rejected sheet from the local list
      setPendingSheets(current => current.filter(s => s.id !== sheetId));
    } catch (error) {
      console.error("Failed to reject sheet:", error);
      alert("Failed to reject sheet. Check console.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
            <UserCheck size={28} className="text-amber-400" />
            Manager Approval Console
          </h1>
          <p className="text-slate-400 mt-1">Review and approve employee goal sheets for Check-in authorization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="text-slate-400 p-8 text-center animate-pulse">Loading pending submissions...</div>
        ) : pendingSheets.length === 0 ? (
          <Card className="border-slate-800 bg-slate-900/60 shadow-lg border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CheckCircle size={48} className="text-emerald-500/50 mb-4" />
              <h3 className="text-xl font-bold text-slate-300">All Caught Up!</h3>
              <p className="text-slate-500 mt-2">There are no pending goal sheets requiring your approval.</p>
            </CardContent>
          </Card>
        ) : (
          pendingSheets.map(sheet => (
            <Card key={sheet.id} className="border-amber-500/30 bg-slate-900/80 shadow-lg shadow-amber-500/5 hover:border-amber-500/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Clock size={12} /> Pending Approval
                      </span>
                      <span className="text-slate-500 text-sm">{sheet.fiscalYear}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mt-2">
                      Employee: <span className="text-amber-400">
                        {users.find(u => u.uid === sheet.employeeId)?.name || sheet.employeeId}
                      </span>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-2">
                      <span>{sheet.goalCount} Goals Drafted</span>
                      <span>&bull;</span>
                      <span className={sheet.totalWeightage === 100 ? 'text-emerald-400' : 'text-rose-400 flex items-center gap-1'}>
                        {sheet.totalWeightage !== 100 && <AlertTriangle size={14} />}
                        {sheet.totalWeightage}% Total Weightage
                      </span>
                    </div>

                    <div className="mt-4">
                      <Textarea 
                        placeholder="Add feedback or notes (optional)..."
                        value={notes[sheet.id] || ''}
                        onChange={(e) => setNotes({...notes, [sheet.id]: e.target.value})}
                        className="h-20 bg-slate-800/50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-w-[200px]">
                    <Button 
                      variant="primary" 
                      className="bg-emerald-600 hover:bg-emerald-500 text-white w-full gap-2 shadow-lg shadow-emerald-900/20"
                      onClick={() => handleApprove(sheet.id)}
                      disabled={processingId !== null}
                    >
                      <CheckCircle size={18} />
                      {processingId === sheet.id ? 'Approving...' : 'Approve & Lock'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 w-full gap-2"
                      onClick={() => handleReject(sheet.id)}
                      disabled={processingId !== null}
                    >
                      <XCircle size={18} />
                      {processingId === sheet.id + "_reject" ? 'Rejecting...' : 'Reject / Return'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
