import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { fetchActiveApprovedSheet } from '../../services/goalService';
import { fetchAcceptedSharedTasks, updateAcceptedTaskStatus } from '../../services/sharedTaskService';
import { useAuth } from '../../context/AuthContext';
import { useCycle } from '../../context/CycleContext';
import { Lock, Calendar, TrendingUp, BarChart3, CheckCircle } from 'lucide-react';

export default function CheckinDashboard() {
  const { user } = useAuth();
  const { activeCycle } = useCycle();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actuals, setActuals] = useState<Record<string, string | number>>({});
  const [selectedQuarter, setSelectedQuarter] = useState(activeCycle.activeQuarter);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [acceptedSharedTasks, setAcceptedSharedTasks] = useState<any[]>([]);

  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);

  useEffect(() => {
    const loadGoals = async () => {
      setLoading(true);
      try {
        const [approvedData, sharedTasks] = await Promise.all([
          fetchActiveApprovedSheet(user!.uid, activeCycle.fiscalYear),
          fetchAcceptedSharedTasks(user!.uid)
        ]);
        
        setAcceptedSharedTasks(sharedTasks);

        if (approvedData && approvedData.goals) {
          setGoals(approvedData.goals);
          setActiveSheetId(approvedData.id);
          // Populate actuals from active quarter if exists
          const loadedActuals: Record<string, string | number> = {};
          approvedData.goals.forEach(g => {
            if (g.achievements && g.achievements[selectedQuarter]) {
              loadedActuals[g.id] = g.achievements[selectedQuarter].actual;
            }
          });
          setActuals(loadedActuals);
        } else {
          setGoals([]);
        }
      } catch (e) {
        console.error("Failed to load approved goals", e);
      } finally {
        setLoading(false);
      }
    };
    loadGoals();
  }, [activeCycle.fiscalYear, selectedQuarter]);

  useEffect(() => {
    setIsWindowOpen(activeCycle.isCheckinOpen);
  }, [activeCycle.isCheckinOpen]);

  const handleActualChange = (goalId: string, val: string) => {
    setActuals((prev) => ({ ...prev, [goalId]: val }));
  };

  const calculateProgress = (goal: Goal, actualVal: string | number) => {
    if (!actualVal) return 0;
    
    let progress = 0;
    const actual = Number(actualVal);
    
    switch (goal.unit) {
      case 'Timeline':
        if (new Date(actualVal).getTime() <= new Date(goal.target).getTime()) {
          progress = 100;
        } else {
          progress = 0;
        }
        break;
      case 'Zero-based':
        if (actual <= goal.target) progress = 100;
        else {
          progress = Math.max(0, 100 - (((actual - goal.target) / goal.target) * 100));
        }
        break;
      case 'Numeric':
      case '%':
      default:
        progress = (actual / goal.target) * 100;
        break;
    }
    
    return Math.min(progress, 120);
  };

  const computeTotalScore = () => {
    let totalScore = 0;
    goals.forEach((goal) => {
      const progress = calculateProgress(goal, actuals[goal.id]);
      totalScore += progress * (goal.weightage / 100);
    });
    return totalScore;
  };

  if (!isWindowOpen) {
    return (
      <div className="max-w-4xl mx-auto mt-20 animate-in fade-in duration-300">
        <Card className="text-center p-12 border-slate-700 bg-slate-900/80">
          <Lock className="w-20 h-20 mx-auto text-slate-600 mb-6" />
          <h2 className="text-3xl font-bold text-slate-200 mb-4">Check-ins are Closed</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            The Quarterly Check-in window is currently locked for {activeCycle.fiscalYear}.
          </p>
        </Card>
      </div>
    );
  }

  const totalScore = computeTotalScore();

  const handleCheckin = async () => {
    if (!activeSheetId) return;
    try {
      const { submitQuarterlyCheckin } = await import('../../services/goalService');
      await submitQuarterlyCheckin(activeSheetId, selectedQuarter, actuals);
      
      const updatedGoals = goals.map(g => ({
        ...g,
        achievements: {
          ...g.achievements,
          [selectedQuarter]: {
            actual: actuals[g.id],
            status: "Logged",
            timestamp: new Date()
          }
        }
      }));
      setGoals(updatedGoals);
      alert("Check-in submitted successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to submit check-in");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Quarterly Check-in ({selectedQuarter.toUpperCase()})
          </h1>
        </div>
        <div className="text-right bg-slate-900/50 p-4 rounded-xl border border-slate-700">
          <div className="text-sm text-slate-400">Overall Quarter Score</div>
          <div className="text-3xl font-bold text-emerald-400">
            {totalScore.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          {goals.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Calendar className="w-16 h-16 mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-medium text-slate-300 mb-2">No Goals Found</h3>
              <p className="text-slate-500">You need to have drafted and approved goals to participate in the check-in.</p>
            </Card>
          ) : (
            goals.map((goal) => {
              const progress = calculateProgress(goal, actuals[goal.id]);
              const weightedScore = progress * (goal.weightage / 100);

              return (
                <Card key={goal.id} className="transition-all border-slate-700/50 hover:border-blue-500/30">
                  <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-500/20 text-blue-400">
                            {goal.thrustArea}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Weight: {goal.weightage}%
                          </span>
                        </div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">Target</div>
                        <div className="font-bold text-slate-200">
                          {goal.target} {goal.unit !== 'Numeric' ? goal.unit : ''}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                      <div className="md:col-span-4">
                        <Input
                          label="Actual Achievement"
                          type={goal.unit === 'Timeline' ? 'date' : 'number'}
                          value={actuals[goal.id] || ''}
                          onChange={(e) => handleActualChange(goal.id, e.target.value)}
                          placeholder="Log actual..."
                        />
                      </div>
                      <div className="md:col-span-8 space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400 flex items-center gap-1">
                            <TrendingUp size={14} /> Progress
                          </span>
                          <span className="font-bold text-slate-200">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-700 ${progress >= 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs border-t border-slate-800 pt-3">
                          <span className="text-slate-500">Calculated Weighted Score:</span>
                          <span className="font-bold text-blue-400">{weightedScore.toFixed(1)} points</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <Card className="sticky top-8 bg-slate-900/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 size={18} className="text-blue-400" />
                Quarterly Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Goals Tracked</div>
                <div className="text-2xl font-bold text-slate-200">{goals.length}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <div className="text-sm text-slate-400 mb-1">Max Potential Score</div>
                <div className="text-2xl font-bold text-slate-200">
                  {goals.reduce((acc, g) => acc + g.weightage, 0) * 1.2}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Capped at 120% per goal</div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Button 
                  className="w-full gap-2 font-bold" 
                  variant="primary"
                  onClick={handleCheckin}
                  disabled={!activeCycle.isCheckinOpen}
                >
                  <CheckCircle size={18} />
                  Submit Check-in
                </Button>
              </div>
              
            </CardContent>
          </Card>
        </div>

      </div>
      {/* Checkin Modals and the rest */}
      
      {/* Accepted Shared Tasks Section */}
      {acceptedSharedTasks.length > 0 && (
        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle className="text-blue-400" />
            Accepted Shared Tasks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedSharedTasks.map(task => (
              <div key={task.id} className="p-5 rounded-xl border border-slate-700 bg-slate-900/60 shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                    {task.department}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {task.status || 'In Progress'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">{task.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>
                <Button 
                  onClick={async () => {
                    const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
                    await updateAcceptedTaskStatus(user!.uid, task.id, newStatus);
                    setAcceptedSharedTasks(acceptedSharedTasks.map(t => 
                      t.id === task.id ? { ...t, status: newStatus } : t
                    ));
                  }}
                  variant={task.status === 'Completed' ? 'secondary' : 'default'}
                  className={`w-full gap-2 ${task.status === 'Completed' ? '' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  <CheckCircle size={16} /> 
                  {task.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
