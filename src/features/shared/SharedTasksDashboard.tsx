import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Briefcase, Plus, Trash2, Globe, Building2 } from 'lucide-react';
import { fetchSharedTasks, createSharedTask, deleteSharedTask } from '../../services/sharedTaskService';
import type { SharedTask } from '../../types';
import { useAuth } from '../../context/AuthContext';

export default function SharedTasksDashboard() {
  const { role, user } = useAuth();
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Global');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchSharedTasks();
      setTasks(data);
    } catch (e) {
      console.error("Failed to load shared tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    try {
      await createSharedTask({
        title,
        description,
        department,
        createdBy: user?.displayName || user?.email || 'Unknown'
      });
      setTitle('');
      setDescription('');
      setDepartment('Global');
      setIsCreating(false);
      loadTasks();
    } catch (e) {
      console.error("Failed to create shared task", e);
      alert("Failed to create shared task");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shared task?")) return;
    try {
      await deleteSharedTask(id);
      loadTasks();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-3">
            <Briefcase size={28} className="text-blue-400" />
            Shared Tasks
          </h1>
          <p className="text-slate-400 mt-1">Cross-functional and departmental goals assigned by leadership.</p>
        </div>
        
        {(role === 'manager' || role === 'admin') && (
          <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
            <Plus size={16} /> {isCreating ? 'Cancel' : 'New Shared Task'}
          </Button>
        )}
      </div>

      {isCreating && (role === 'manager' || role === 'admin') && (
        <Card className="border-blue-500/30 bg-slate-900/80 shadow-xl shadow-blue-500/10 mb-8 animate-in slide-in-from-top-4">
          <CardHeader>
            <CardTitle>Create Shared Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Task Title" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g., Q3 Security Compliance Training" 
                  required 
                />
                <Select 
                  label="Target Department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  options={[
                    { label: 'Global (All Departments)', value: 'Global' },
                    { label: 'Engineering', value: 'Engineering' },
                    { label: 'Marketing', value: 'Marketing' },
                    { label: 'Sales', value: 'Sales' },
                    { label: 'HR', value: 'HR' }
                  ]}
                />
              </div>
              <Textarea 
                label="Description & Instructions" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Details about what needs to be done..." 
                required 
              />
              <Button type="submit" className="w-full">Broadcast Shared Task</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center text-slate-500 py-12 animate-pulse">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-slate-500 py-12 border border-slate-800 rounded-xl bg-slate-900/30">
          No shared tasks have been broadcasted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <Card key={task.id} className="border-slate-700 bg-slate-900/60 hover:border-slate-600 transition-colors group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                    task.department === 'Global' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {task.department === 'Global' ? <Globe size={12} /> : <Building2 size={12} />}
                    {task.department}
                  </div>
                  {(role === 'manager' || role === 'admin') && (
                    <button 
                      onClick={() => handleDelete(task.id)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2 leading-tight">{task.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-3">{task.description}</p>
                <div className="text-xs text-slate-500 pt-4 border-t border-slate-800">
                  Broadcasted by: <span className="text-slate-300">{task.createdBy}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
