import React, { useState, useEffect } from 'react';
import { 
    Upload, 
    FileText, 
    Download, 
    Share2, 
    CheckCircle2, 
    Search, 
    Clock, 
    AlertCircle, 
    User, 
    Calendar,
    ArrowRight,
    FileType,
    Eye,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function ReportManagement() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings();
            if (res.success) {
                // All bookings are effectively "report placeholders"
                setReports(res.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = reports.filter(r => 
        r.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 italic">Diagnostic Report Management</h1>
                    <p className="text-gray-600 font-medium">Generate, upload, and dispatch test reports to clinics and patients</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Bulk Upload Reports
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                   { label: 'Reports Pending', count: reports.filter(r => r.status !== 'Completed').length, icon: Clock, color: 'orange' },
                   { label: 'Completed Reports', count: reports.filter(r => r.status === 'Completed').length, icon: CheckCircle2, color: 'green' },
                   { label: 'Total Logs', count: reports.length, icon: FileText, color: 'blue' },
                   { label: 'Recent Activity', count: reports.length > 0 ? 'Today' : 'N/A', icon: AlertCircle, color: 'purple' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex flex-row items-center gap-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-xl font-black text-gray-900 italic">{stat.count}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-lg border-blue-50 overflow-hidden bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gray-50/50">
                     <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200"><FileText className="w-5 h-5" /></div>
                        <CardTitle className="text-lg uppercase italic font-black text-gray-900">Report Dispatch Center</CardTitle>
                     </div>
                     <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-bold" />
                         <Input 
                            placeholder="Search reports..." 
                            className="pl-10 h-10 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                         />
                     </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-left">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredReports.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Report ID</th>
                                        <th className="px-6 py-4">Patient / Test</th>
                                        <th className="px-6 py-4">Status Update Time</th>
                                        <th className="px-6 py-4">Dispatcher Status</th>
                                        <th className="px-6 py-4">File Details</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-left">
                                    {filteredReports.map((report) => (
                                        <tr key={report.order_id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-6 py-4 text-left">
                                                <Badge className="bg-gray-900 group-hover:bg-blue-600 transition-colors uppercase font-bold text-[10px] tracking-widest px-2 py-0.5">REP-{report.order_id}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 mb-1"><User className="w-3 h-3 text-gray-400" /><span className="font-black text-gray-900 uppercase italic text-xs">{report.patient_name}</span></div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-black uppercase tracking-widest italic border-l-2 border-blue-600 pl-2 ml-1"><FileType className="w-3 h-3" /> {report.test_name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <div className="flex items-center gap-2 text-gray-600 font-black italic text-[10px] uppercase">
                                                    <Calendar className="w-3 h-3" /> {new Date(report.updated_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                {report.status === 'Completed' ? (
                                                    <Badge className="bg-green-50 text-green-700 border-green-200 uppercase font-black text-[10px] tracking-widest flex w-fit gap-1 items-center px-2 py-1 shadow-sm border">
                                                        <CheckCircle2 className="w-3 h-3" /> DISPATCHED
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-orange-50 text-orange-700 border-orange-200 uppercase font-black text-[10px] tracking-widest flex w-fit gap-1 items-center px-2 py-1 border animate-pulse">
                                                        <Clock className="w-3 h-3" /> PENDING UPLOAD
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                {report.status === 'Completed' ? (
                                                    <div className="text-[10px] space-y-0.5">
                                                        <p className="font-black text-gray-700 uppercase tracking-widest">DIGITAL_SIGNED_PDF</p>
                                                        <p className="text-gray-400 font-bold italic">Verification Locked</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-300 italic text-xs uppercase font-black">Waiting for Results</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {report.status === 'Completed' ? (
                                                        <React.Fragment>
                                                            <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border shadow-sm bg-white" title="Download"><Download className="w-4 h-4" /></button>
                                                            <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border shadow-sm bg-white" title="Preview"><Eye className="w-4 h-4" /></button>
                                                            <button className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border shadow-sm bg-white" title="Share"><Share2 className="w-4 h-4" /></button>
                                                        </React.Fragment>
                                                    ) : (
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-8 px-3 shadow-md font-black uppercase text-[9px] tracking-widest rounded-lg">
                                                            <Upload className="w-3 h-3" /> Upload Report <ArrowRight className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 m-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 italic">No reportable data found</h3>
                                <p className="text-gray-500">Only bookings with active status will appear in the dispatch center.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

