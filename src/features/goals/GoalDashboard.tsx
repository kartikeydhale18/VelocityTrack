import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { AlertCircle, CheckCircle2, Plus, Send, AlertTriangle, Target, Briefcase } from 'lucide-react';
import type { Goal } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface GoalDashboardProps {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const THRUST_AREAS = [
  { label: 'Revenue Growth', value: 'Revenue Growth' },
  { label: 'Operational Excellence', value: 'Operational Excellence' },
  { label: 'Customer Satisfaction', value: 'Customer Satisfaction' },
  { label: 'Innovation', value: 'Innovation' },
  { label: 'Team Development', value: 'Team Development' }
];

const UNITS = [
  { label: 'Numeric', value: 'Numeric' },
  { label: 'Percentage (%)', value: '%' },
  { label: 'Timeline', value: 'Timeline' },
  { label: 'Zero-based', value: 'Zero-based' }
];

export default function GoalDashboard({ goals, setGoals }: GoalDashboardProps) {
  const { user } = useAuth();
  // Form State
  const [thrustArea, setThrustArea] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Numeric');
  const [target, setTarget] = useState('');
  const [weightage, setWeightage] = useState('');

  const totalGoals = goals.length;
  const totalWeightage = goals.reduce((acc, g) => acc + g.weightage, 0);
  const hasLowWeightage = goals.some((g) => g.weightage < 10);

  const isCountValid = totalGoals > 0 && totalGoals <= 8;
  const isWeightageValid = totalWeightage === 100;
  const isAllValid = isCountValid && isWeightageValid && !hasLowWeightage;

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thrustArea || !title || !target || !weightage) return;

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      thrustArea,
      title,
      description,
      unit,
      target: Number(target),
      weightage: Number(weightage)
    };

    setGoals([...goals, newGoal]);
    
    // Reset form
    setTitle('');
    setDescription('');
    setTarget('');
    setWeightage('');
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmitToManager = async () => {
    if (!isAllValid) return;
    setIsSubmitting(true);
    try {
      // Dynamic import to avoid circular dependencies or load times if needed, 
      // but we can just import it at the top normally. Wait, I will just require it here for speed.
      const { submitGoalSheet } = await import('../../services/goalService');
      await submitGoalSheet(user!.uid, 'FY26', goals);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
      setGoals([]); // Clear draft after submit
    } catch (error) {
      console.error("Failed to submit:", error);
      alert("Failed to submit goals to Firebase. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Goal Drafting
          </h1>
          <p className="text-slate-400 mt-1">Define and manage your key performance indicators.</p>
        </div>
        <div className="flex items-center gap-4">
          {submitSuccess && (
            <span className="text-emerald-400 text-sm font-medium animate-pulse flex items-center gap-1">
              <CheckCircle2 size={16} /> Saved to Firebase!
            </span>
          )}
          <Button 
            variant="primary" 
            size="lg"
            disabled={!isAllValid || isSubmitting}
            className="gap-2"
            onClick={handleSubmitToManager}
          >
            <Send size={18} />
            {isSubmitting ? 'Submitting...' : 'Submit to Manager'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Draft Area */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size={20} className="text-blue-400" />
                Add New Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGoal} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Thrust Area"
                    value={thrustArea}
                    onChange={(e) => setThrustArea(e.target.value)}
                    options={THRUST_AREAS}
                    required
                  />
                  <Input
                    label="Goal Title"
                    placeholder="E.g. Increase Q3 Sales"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                
                <Textarea
                  label="Description"
                  placeholder="Provide detailed context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Select
                    label="Unit of Measurement"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    options={UNITS}
                    required
                  />
                  <Input
                    label="Target"
                    type={unit === 'Timeline' ? 'date' : 'number'}
                    placeholder="1000"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                  />
                  <Input
                    label="Weightage (%)"
                    type="number"
                    placeholder="15"
                    min="1"
                    max="100"
                    value={weightage}
                    onChange={(e) => setWeightage(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="secondary" className="gap-2">
                    <Plus size={16} />
                    Add to Draft
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Goals List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Briefcase size={20} className="text-emerald-400" />
              Drafted Goals
            </h2>
            
            {goals.length === 0 ? (
              <div className="text-center p-12 bg-slate-900/30 border border-slate-800 rounded-2xl border-dashed">
                <Target size={48} className="mx-auto text-slate-600 mb-4" />
                <p className="text-slate-400">No goals drafted yet. Add one above to get started.</p>
              </div>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id} className="transition-all hover:border-slate-600">
                  <CardContent className="flex items-center justify-between py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {goal.thrustArea}
                        </span>
                        <h4 className="font-semibold text-slate-200">{goal.title}</h4>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{goal.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-6 ml-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-300">Target: {goal.target} {goal.unit !== 'Numeric' && goal.unit}</div>
                        <div className={`text-sm font-bold ${goal.weightage < 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {goal.weightage}% Weight
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveGoal(goal.id)} className="text-slate-500 hover:text-red-400">
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Constraint Monitor */}
        <div className="space-y-6">
          <Card className="sticky top-8 border-slate-700/50 bg-slate-900/80">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle size={18} className="text-blue-400" />
                Live Constraint Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Constraint 1: Total Goals Count */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-300">Total Goals (Max 8)</span>
                  <span className={totalGoals > 8 ? 'text-red-400' : 'text-slate-300'}>{totalGoals}/8</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${totalGoals > 8 ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((totalGoals / 8) * 100, 100)}%` }}
                  />
                </div>
                {totalGoals > 8 && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} /> Too many goals added.
                  </p>
                )}
              </div>

              {/* Constraint 2: Total Weightage */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-300">Total Weightage</span>
                  <span className={isWeightageValid ? 'text-emerald-400' : 'text-amber-400'}>{totalWeightage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      totalWeightage === 100 ? 'bg-emerald-500' : 
                      totalWeightage > 100 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(totalWeightage, 100)}%` }}
                  />
                </div>
                {totalWeightage !== 100 && (
                  <p className={`text-xs flex items-center gap-1 mt-1 ${totalWeightage > 100 ? 'text-red-400' : 'text-amber-400'}`}>
                    {totalWeightage > 100 ? <AlertCircle size={12} /> : <AlertTriangle size={12} />}
                    Weightage must exactly equal 100%.
                  </p>
                )}
              </div>

              {/* Constraint 3: Individual Weight Check */}
              <div className={`p-4 rounded-xl border ${hasLowWeightage ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800/30 border-slate-700'}`}>
                <div className="flex items-start gap-3">
                  {hasLowWeightage ? (
                    <AlertTriangle size={18} className="text-amber-400 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={18} className="text-emerald-400 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`text-sm font-medium ${hasLowWeightage ? 'text-amber-400' : 'text-slate-300'}`}>
                      Minimum Weight Check
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {hasLowWeightage 
                        ? "One or more goals have < 10% weightage. Please revise." 
                        : "All goals meet the minimum 10% weightage threshold."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className={`flex items-center justify-center gap-2 text-sm font-medium px-4 py-3 rounded-lg ${isAllValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                  {isAllValid ? (
                    <>
                      <CheckCircle2 size={18} />
                      All Constraints Met
                    </>
                  ) : (
                    <>
                      <AlertCircle size={18} />
                      Resolve constraints to submit
                    </>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
