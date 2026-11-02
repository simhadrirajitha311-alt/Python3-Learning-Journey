import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Pause,
  AlertOctagon,
  RefreshCw,
  Clock,
  Terminal,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import type { AutomationTask } from '../types';

export const AutomationCenterView: React.FC = () => {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    api.getTasks()
      .then((res) => setTasks(res.tasks))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTask = async (task: AutomationTask) => {
    try {
      if (task.status === 'running') {
        await api.pauseTask(task.id);
      } else {
        await api.resumeTask(task.id);
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmergencyStop = async () => {
    if (!window.confirm('Activate Emergency Killswitch? This will immediately halt all Celery workers and background tasks.')) {
      return;
    }
    try {
      const res = await api.emergencyStop();
      setEmergencyMessage(res.message);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
              Cloud Automation & Celery Worker Engine
            </h1>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              Redis Broker: Online
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Autonomous background workers running crawlers, deadline alerts, and follow-up monitors with strict safety killswitches.
          </p>
        </div>

        {/* Emergency Stop Button */}
        <button
          onClick={handleEmergencyStop}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
        >
          <AlertOctagon className="h-4 w-4" />
          <span>Emergency Killswitch</span>
        </button>
      </div>

      {emergencyMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-900 flex items-center gap-2 font-bold animate-in fade-in">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0" />
          <span>{emergencyMessage}</span>
        </div>
      )}

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tasks.map((task) => {
          const isRunning = task.status === 'running';
          return (
            <div
              key={task.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{task.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{task.schedule}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isRunning
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {isRunning ? 'Running' : 'Paused'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Last Execution:</span>
                    <span>{new Date(task.lastRun).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Next Scheduled:</span>
                    <span className="font-semibold text-blue-700">
                      {task.nextRun.includes('Paused') ? 'Paused' : new Date(task.nextRun).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={fetchTasks}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                  title="Refresh status"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleToggleTask(task)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    isRunning
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3 w-3" />
                      <span>Pause Task</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      <span>Resume Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Worker Execution Terminal */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100 shadow-md space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-slate-200">Celery Worker Stream Output [careerbridge_celery_main]</span>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Worker Heartbeat OK
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto text-slate-300">
          {tasks.flatMap((t) => t.logs).map((log, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[11px]">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className="text-slate-300">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
