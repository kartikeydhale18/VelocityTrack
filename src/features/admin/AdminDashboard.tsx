import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, Download, Activity, FileSpreadsheet, RefreshCcw } from 'lucide-react';
import { fetchQuarterlyCompliance, exportPerformanceCSV } from '../../services/adminService';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({ totalActive: 0, totalCompleted: 0, complianceRate: 0 });

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchQuarterlyCompliance();
      setStats(data);
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
    </div>
  );
}
