import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserPlus } from 'lucide-react';
import type { UserProfile } from '../../types';

interface OnboardingModalProps {
  user: UserProfile;
  onComplete: (data: Partial<UserProfile>) => Promise<void>;
}

export default function OnboardingModal({ user, onComplete }: OnboardingModalProps) {
  const [formData, setFormData] = useState({
    department: '',
    designation: '',
    phoneNumber: '',
    salary: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department || !formData.designation) return;
    setLoading(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error("Failed to complete onboarding", error);
      alert("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg border-blue-500/20 bg-slate-900 shadow-2xl shadow-blue-500/10 animate-in fade-in zoom-in duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            <UserPlus size={24} className="text-blue-400" />
            Complete Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 mb-6 text-sm">
            Welcome, <span className="font-semibold text-slate-200">{user.name}</span>! Please complete your profile setup before accessing VelocityTrack. This information helps HR route your performance goals correctly.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Department <span className="text-rose-400">*</span></label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="" disabled>Select your department</option>
                <option value="Engineering">Engineering</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Job Title / Designation <span className="text-rose-400">*</span></label>
              <Input
                required
                placeholder="e.g. Senior Software Engineer"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="bg-slate-950 border-slate-800 focus:border-blue-500 text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number</label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus:border-blue-500 text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Salary</label>
                <Input
                  type="number"
                  placeholder="e.g. 75000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="bg-slate-950 border-slate-800 focus:border-blue-500 text-slate-200"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all">
                {loading ? 'Saving Profile...' : 'Complete Setup & Continue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
