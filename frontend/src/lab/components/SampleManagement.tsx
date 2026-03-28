import { useState, useEffect } from 'react';
import { 
    Activity, 
    Truck, 
    UserPlus, 
    BadgeCheck, 
    Clock, 
    Search, 
    MoreVertical,
    Droplet,
    Home
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function SampleManagement() {
    const [samples, setSamples] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSamples();
    }, []);

    const fetchSamples = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings();
            if (res.success) {
                // Filter for samples that are not yet completed
                setSamples(res.data.filter((s: any) => s.status !== 'Completed'));
            }
        } catch (error) {
            console.error('Error fetching samples:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSamples = samples.filter(s => 
        s.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.test_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'orange';
            case 'sample collected': return 'blue';
            case 'processing': return 'purple';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sample Collection Management</h1>
                    <p className="text-gray-600 font-medium">Track sample statuses and assign technicians for home collection</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2 bg-white">
                         Assign Bulk Tasks
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Home Collection Map
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Samples', count: samples.filter(s => s.status === 'Pending').length, icon: Clock, color: 'orange' },
                    { label: 'Collected Samples', count: samples.filter(s => s.status === 'Sample Collected').length, icon: BadgeCheck, color: 'blue' },
                    { label: 'Samples In Process', count: samples.filter(s => s.status === 'Processing').length, icon: Activity, color: 'purple' },
                    { label: 'Home Requests', count: samples.filter(s => s.collection_type === 'Home').length, icon: Home, color: 'green' },
                ].map((state, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-md transition-all group overflow-hidden border-b-4 border-b-gray-100 hover:border-b-blue-500">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{state.label}</p>
                                <h3 className="text-2xl font-black text-gray-900">{state.count}</h3>
                            </div>
                            <div className={`p-3 rounded-xl bg-${state.color}-50 group-hover:scale-110 transition-transform`}>
                                <state.icon className={`w-5 h-5 text-${state.color}-600`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-lg border-blue-50 bg-white">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                     <div className="flex items-center gap-2">
                         <div className="p-2 bg-blue-600 rounded-lg text-white shadow-md shadow-blue-200"><Droplet className="w-5 h-5" /></div>
                         <CardTitle className="text-lg">Live Sample Pipeline</CardTitle>
                     </div>
                     <div className="relative w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-bold" />
                         <Input 
                            placeholder="Filter samples..." 
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
                        ) : filteredSamples.length > 0 ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-xs uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Sample ID</th>
                                        <th className="px-6 py-4">Patient Details</th>
                                        <th className="px-6 py-4">Test Description</th>
                                        <th className="px-6 py-4">Collection Type</th>
                                        <th className="px-6 py-4">Current Status</th>
                                        <th className="px-6 py-4">Assigned Tech</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-left">
                                    {filteredSamples.map((sample) => (
                                        <tr key={sample.order_id} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="px-6 py-4"><Badge className="bg-gray-900">SMP-{sample.order_id}</Badge></td>
                                            <td className="px-6 py-4 font-semibold text-gray-900 uppercase italic text-xs">{sample.patient_name} <span className="text-gray-400 font-normal">({sample.patient_age || 'N/A'})</span></td>
                                            <td className="px-6 py-4 text-gray-600 font-bold italic text-xs uppercase">{sample.test_name}</td>
                                            <td className="px-6 py-4">
                                                {sample.collection_type === 'Home' ? (
                                                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 flex gap-1 items-center w-fit font-black text-[10px] uppercase">
                                                        <Truck className="w-3 h-3" /> Home Required
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 font-black text-[10px] uppercase">Walking</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full bg-${getStatusColor(sample.status)}-500`} />
                                                    <span className="capitalize font-black text-gray-700 uppercase text-[10px] tracking-widest italic">{sample.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {sample.technician_name ? (
                                                    <div className="flex items-center gap-2 group cursor-pointer">
                                                        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-black uppercase">{sample.technician_name.charAt(0)}</div>
                                                        <span className="font-bold text-gray-700 hover:text-blue-600 uppercase text-[10px] tracking-widest">{sample.technician_name}</span>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="text-blue-600 font-black hover:bg-blue-50 h-8 flex items-center gap-1 uppercase text-[10px] tracking-widest p-0">
                                                        <UserPlus className="w-3 h-3" /> Assign Tech
                                                    </Button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 group">
                                                    <MoreVertical className="w-4 h-4 group-hover:text-blue-600" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20">
                                <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 italic">No samples in pipeline</h3>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

