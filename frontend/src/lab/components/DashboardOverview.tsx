import React, { useEffect, useState } from 'react';
import { 
    FlaskConical, 
    CheckCircle, 
    Clock, 
    TrendingUp, 
    Activity, 
    Users, 
    FileText,
    ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import labService from '../../services/labService';

export function DashboardOverview() {
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await labService.getDashboardStats();
            if (res.success) {
                setStatsData(res.data);
            }
        } catch (error) {
            console.error('Error fetching lab stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total Tests Today', value: statsData?.totalTestsToday || '0', icon: FlaskConical, color: 'blue', change: '+0%' },
        { label: 'Total Bookings', value: statsData?.totalBookings || '0', icon: Users, color: 'purple', change: '+0%' },
        { label: 'Pending Reports', value: statsData?.pendingReports || '0', icon: Clock, color: 'orange', change: '0' },
        { label: 'Completed Reports', value: statsData?.completedReports || '0', icon: CheckCircle, color: 'green', change: '+0%' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lab Dashboard Overview</h1>
                    <p className="text-gray-600 font-medium">Welcome to your diagnostic command center</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Export Today's Summary
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                    <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-orange-600'}`}>
                                        {stat.change} from yesterday
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Summary Card */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> Revenue Summary
                        </CardTitle>
                        <select className="text-xs bg-gray-50 border border-gray-200 rounded p-1">
                            <option>Last 7 Days</option>
                            <option>Last Month</option>
                        </select>
                    </CardHeader>
                    <CardContent className="h-[250px] flex items-center justify-center bg-gray-50 m-4 rounded-lg border border-dashed">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">Revenue analytics visualization</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">Total: ₹{statsData?.revenueSummary?.toLocaleString() || '0'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-600" /> Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {statsData?.recentActivity?.length > 0 ? statsData.recentActivity.map((activity: any) => (
                                <div key={activity.lab_order_id} className="flex gap-3 items-start p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                        activity.status === 'Pending' ? 'bg-orange-400' : 
                                        activity.status === 'Sample Collected' ? 'bg-blue-400' : 'bg-green-400'
                                    }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{activity.patient?.full_name}</p>
                                        <p className="text-xs text-gray-600">{activity.status} - ID: {activity.lab_order_id}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">{new Date(activity.order_date).toLocaleDateString()}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 text-sm italic">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-xs font-semibold text-blue-600 py-1">View Full Log</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

