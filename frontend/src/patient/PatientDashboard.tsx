import {
  Calendar,
  FileText,
  Activity,
  CreditCard,
  Heart,
  Footprints,
  Pill,
  Upload,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Badge } from '../common/ui/badge';
import { Button } from '../common/ui/button';
import { Avatar, AvatarFallback } from '../common/ui/avatar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PatientUser, PatientPage } from './PatientPortal';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { patientService } from '../services/patientService';

interface PatientDashboardProps {
  patient: PatientUser;
  onNavigate: (page: PatientPage) => void;
}

interface Appointment {
  appointment_id: string;
  appointment_date: string;
  status: string;
  doctor?: {
    full_name: string;
    qualifications: string;
  };
  clinic?: {
    clinic_name: string;
  };
}

const heartRateData = [
  { day: 'Mon', bpm: 72 },
  { day: 'Tue', bpm: 75 },
  { day: 'Wed', bpm: 70 },
  { day: 'Thu', bpm: 73 },
  { day: 'Fri', bpm: 71 },
  { day: 'Sat', bpm: 74 },
  { day: 'Sun', bpm: 72 }
];

const stepsData = [
  { day: 'Mon', steps: 8500 },
  { day: 'Tue', steps: 10200 },
  { day: 'Wed', steps: 7800 },
  { day: 'Thu', steps: 9500 },
  { day: 'Fri', steps: 11000 },
  { day: 'Sat', steps: 6500 },
  { day: 'Sun', steps: 8800 }
];

const getActivityDetails = (type: string) => {
  switch (type) {
    case 'appointment':
      return { icon: Calendar, color: 'text-pink-600', bgColor: 'bg-pink-100' };
    case 'report':
      return { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    case 'prescription':
      return { icon: Pill, color: 'text-purple-600', bgColor: 'bg-purple-100' };
    default:
      return { icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  }
};

const formatTimeAgo = (timestamp: number) => {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

export function PatientDashboard({ patient, onNavigate }: PatientDashboardProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<{ count: number; appointments: Appointment[] }>({ count: 0, appointments: [] });
  const [dashboardStats, setDashboardStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    healthScore: 0,
    pendingBills: 0,
    recentActivities: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [appointmentsData, statsData] = await Promise.all([
          api.get(`/appointments/upcoming/${patient.id}`),
          patientService.getDashboardStats()
        ]);
        
        setUpcomingAppointments(appointmentsData);
        if (statsData) {
          setDashboardStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patient.id) {
      fetchData();
    }
  }, [patient.id]);

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-semibold text-gray-900 mb-1">
          Welcome back, {patient.name.split(' ')[0]}!
        </h1>
        <p className="text-sm text-gray-600">Manage your health, anytime, anywhere</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Calendar className="size-5 text-pink-600" />
              </div>
              <Badge className="bg-pink-600">View</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Upcoming Appointments</p>
            <p className="text-3xl font-bold text-gray-900">{upcomingAppointments.count}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Pill className="size-5 text-purple-600" />
              </div>
              <Badge 
                className="bg-purple-600 cursor-pointer" 
                onClick={() => onNavigate('prescriptions')}
              >
                View
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Active Prescriptions</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.activePrescriptions}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="size-5 text-green-600" />
              </div>
              <Badge className="bg-green-600">Excellent</Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Health Score</p>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats.healthScore}%</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="size-5 text-orange-600" />
              </div>
              <Badge 
                className="bg-orange-600 cursor-pointer"
                onClick={() => onNavigate('billing')}
              >
                Pay
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pending Bills</p>
            <p className="text-3xl font-bold text-gray-900">₹{dashboardStats.pendingBills.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-pink-900">
              <Heart className="size-5 text-pink-600" />
              Heart Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={heartRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} domain={[60, 80]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fdf2f8',
                    border: '1px solid #fbcfe8',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={{ fill: '#ec4899', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Footprints className="size-5 text-purple-600" />
              Daily Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="steps" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-pink-200">
        <CardHeader>
          <CardTitle className="text-pink-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
              onClick={() => onNavigate('book-appointment')}
            >
              <Calendar className="size-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>

            <Button
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              onClick={() => onNavigate('prescriptions')}
            >
              <Upload className="size-6" />
              <span className="text-sm">Upload Report</span>
            </Button>

            <Button
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => onNavigate('prescriptions')}
            >
              <FileText className="size-6" />
              <span className="text-sm">View Prescriptions</span>
            </Button>

            <Button
              className="h-auto flex-col gap-2 py-4 bg-gradient-to-br from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700"
              onClick={() => onNavigate('billing')}
            >
              <CreditCard className="size-6" />
              <span className="text-sm">Pay Bills</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentActivities && dashboardStats.recentActivities.length > 0 ? (
                dashboardStats.recentActivities.map((activity) => {
                  const details = getActivityDetails(activity.type);
                  const Icon = details.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors">
                      <div className={`p-2 rounded-lg ${details.bgColor}`}>
                        <Icon className={`size-5 ${details.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimeAgo(activity.time)}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-900 flex items-center justify-between">
              <span>Upcoming Appointments</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                onClick={() => onNavigate('book-appointment')}
              >
                Book New
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading appointments...</p>
              </div>
            ) : !upcomingAppointments?.appointments || upcomingAppointments.appointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.appointments.map((appointment) => (
                <div key={appointment.appointment_id} className="p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-pink-600 text-white">
                        {appointment.doctor?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{appointment.doctor?.full_name || 'Unknown Doctor'}</h4>
                      <p className="text-sm text-gray-600">{appointment.doctor?.qualifications || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="size-4" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()} at {appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}</span>
                    </div>
                    <Badge className="bg-pink-600">{appointment.status || 'Scheduled'}</Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t border-pink-200">
                    <p className="text-xs text-gray-600 mb-2">{appointment.clinic?.clinic_name || 'Clinic'}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
