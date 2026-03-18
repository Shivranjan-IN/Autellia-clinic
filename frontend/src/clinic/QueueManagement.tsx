import { useState, useEffect } from 'react';
import { UserRole } from '../common/types';
import { Users, Clock, CheckCircle, AlertCircle, Play, Pause, ArrowRight, RefreshCw } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast, Toaster } from 'sonner';

interface QueueManagementProps {
  userRole: UserRole;
}

interface QueuePatient {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  appointmentType: string;
  arrivalTime: string;
  estimatedWaitTime: number;
  status: 'scheduled' | 'waiting' | 'in-progress' | 'completed' | 'no-show';
  priority: 'normal' | 'urgent';
}

export function QueueManagement({ userRole }: QueueManagementProps) {
  const [queue, setQueue] = useState<QueuePatient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 30 seconds for live feel
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await clinicService.getQueue();
      // Map backend appointments to QueuePatient interface
      const mappedQueue: QueuePatient[] = data.map((apt: any, idx: number) => ({
        id: apt.appointment_id,
        tokenNumber: idx + 1,
        patientName: apt.patient?.full_name || 'Anonymous',
        patientId: apt.patient_id,
        doctorName: apt.doctor?.full_name || 'Dr. Assigned',
        appointmentType: apt.appointment_type || 'Consultation',
        arrivalTime: apt.appointment_time ? new Date(apt.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        estimatedWaitTime: Math.max(0, (idx) * 15), // Mock estimation
        status: apt.status || 'scheduled',
        priority: (apt.appointment_type === 'emergency' || apt.ai_risk_level === 'high') ? 'urgent' : 'normal'
      }));
      setQueue(mappedQueue);
    } catch (error) {
      console.error('Error fetching queue:', error);
      toast.error('Failed to sync live queue');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const success = await clinicService.updateAppointmentStatus(id, newStatus);
      if (success) {
        toast.success(`Patient status updated to ${newStatus.replace('-', ' ')}`);
        fetchQueue();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const waitingCount = queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').length;
  const inProgressCount = queue.filter(p => p.status === 'in-progress').length;
  const completedCount = queue.filter(p => p.status === 'completed').length;
  const avgWaitTime = queue.length > 0 ? Math.round(queue.reduce((sum, p) => sum + p.estimatedWaitTime, 0) / queue.length) : 0;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Queue Management</h1>
          <p className="text-gray-600">Real-time patient queue and token system</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchQueue}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Avg Wait: {avgWaitTime} min</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{waitingCount}</p>
          <p className="text-sm text-gray-600">Waiting</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
          <p className="text-sm text-gray-600">In Progress</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-gray-600">Completed Today</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{queue.length}</p>
          <p className="text-sm text-gray-600">Total in Queue</p>
        </div>
      </div>

      {/* Current Queue - Display Board Style */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="font-semibold text-gray-900 text-center text-xl">Now Serving</h3>
        </div>
        <div className="p-8">
          {queue.filter(p => p.status === 'in-progress').length > 0 ? (
            queue.filter(p => p.status === 'in-progress').map(patient => (
              <div key={patient.id} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-6 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-green-600 text-white rounded-xl p-6 min-w-[100px] text-center">
                      <p className="text-sm font-medium mb-1">Token</p>
                      <p className="text-4xl font-bold">{patient.tokenNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{patient.patientName}</h3>
                      <p className="text-lg text-gray-600">ID: {patient.patientId}</p>
                      <p className="text-lg text-gray-600 mt-1">Doctor: {patient.doctorName}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Play className="w-6 h-6" />
                      <span className="font-semibold text-lg">IN CONSULTATION</span>
                    </div>
                    {userRole === 'doctor' && (
                       <span className="text-xs text-gray-500 italic">Complete by adding prescription in Doctor Panel</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No patients currently in consultation</p>
            </div>
          )}
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Queue Status (Waiting)</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                Waiting: {waitingCount}
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                Urgent: {queue.filter(p => p.priority === 'urgent' && (p.status === 'scheduled' || p.status === 'waiting')).length}
              </span>
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').length > 0 ? (
            queue.filter(p => p.status === 'scheduled' || p.status === 'waiting').map(patient => (
              <div 
                key={patient.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  patient.priority === 'urgent' ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-4 min-w-[80px] text-center ${
                      patient.priority === 'urgent' 
                        ? 'bg-red-100 border-2 border-red-500' 
                        : 'bg-blue-100 border border-blue-300'
                    }`}>
                      <p className="text-xs font-medium text-gray-600 mb-1">Token</p>
                      <p className={`text-3xl font-bold ${
                        patient.priority === 'urgent' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        {patient.tokenNumber}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 text-lg">{patient.patientName}</h4>
                        {patient.priority === 'urgent' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded-full text-xs font-medium">
                            <AlertCircle className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>ID: {patient.patientId}</span>
                        <span>•</span>
                        <span>{patient.doctorName}</span>
                        <span>•</span>
                        <span>{patient.appointmentType}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Time: {patient.arrivalTime}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-orange-600 font-medium">Est. Wait: {patient.estimatedWaitTime} min</span>
                      </div>
                    </div>
                  </div>

                  {(userRole === 'admin' || userRole === 'receptionist' || userRole === 'doctor') && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(patient.id, 'in-progress')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start
                      </button>
                      <button
                        onClick={() => updateStatus(patient.id, 'no-show')}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        No-show
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
              No patients waiting in queue
            </div>
          )}
        </div>
      </div>

      {/* Completed Today */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recently Completed</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {queue.filter(p => p.status === 'completed').length > 0 ? (
              queue.filter(p => p.status === 'completed').map(patient => (
                <div key={patient.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-green-700">Token {patient.tokenNumber}</span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">{patient.patientName}</p>
                  <p className="text-sm text-gray-600">{patient.doctorName}</p>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-6 text-gray-400">
                No completions recorded yet today
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
