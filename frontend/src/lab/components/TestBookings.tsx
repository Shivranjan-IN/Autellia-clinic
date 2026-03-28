import { useState, useEffect } from 'react';
import { 
    Search, 
    Calendar, 
    Filter, 
    MoreVertical, 
    CheckCircle2, 
    XCircle,
    FileType,
    Activity,
    User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../common/ui/tabs';
import labService from '../../services/labService';

export function TestBookings() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTab, setSelectedTab] = useState('Pending');
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, [selectedTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings({ status: selectedTab });
            if (res.success) {
                setBookings(res.data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: string, status: string) => {
        try {
            const res = await labService.updateBookingStatus(orderId, status);
            if (res.success) {
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredBookings = bookings.filter(b => 
        b.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.lab_order_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Test Bookings & Orders</h1>
                    <p className="text-gray-600 font-medium">Manage incoming test requests from clinics and patients</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Filter by Date
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2">
                        <FileType className="w-4 h-4" /> Bulk Export
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Search patient name or booking ID..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Filter className="w-4 h-4" /> More Filters
                    </Button>
                </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm mb-6">
                    <TabsTrigger value="Pending" className="px-6 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600">
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="Accepted" className="px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                        Accepted
                    </TabsTrigger>
                    <TabsTrigger value="Sample Collected" className="px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600">
                        Samples
                    </TabsTrigger>
                    <TabsTrigger value="Completed" className="px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
                        Completed
                    </TabsTrigger>
                    <TabsTrigger value="Cancelled" className="px-6 data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
                        Cancelled
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <Card key={booking.lab_order_id} className={`relative hover:shadow-lg transition-all border-l-4 overflow-hidden group ${
                                selectedTab === 'Pending' ? 'border-l-orange-500' :
                                selectedTab === 'Accepted' ? 'border-l-blue-500' :
                                selectedTab === 'Completed' ? 'border-l-green-500' : 'border-l-indigo-50'
                            }`}>
                                <CardHeader className="p-4 pb-2 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <Badge variant="outline" className="bg-white">{booking.lab_order_id}</Badge>
                                        <span>• {new Date(booking.order_date).toLocaleDateString()}</span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                                </CardHeader>
                                <CardContent className="p-5 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0">
                                            {booking.patient?.full_name?.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-gray-900 truncate">{booking.patient?.full_name}</h3>
                                            <p className="text-xs text-gray-500">{booking.patient?.gender} • Priority: {booking.priority}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {booking.lab_order_items?.map((item: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Requested Test</p>
                                                <p className="text-sm font-semibold text-gray-900">{item.lab_test_types?.test_name}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                            <User className="w-3 h-3" /> {booking.clinic?.clinic_name || 'Direct Patient'}
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{booking.lab_order_items?.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </CardContent>
                                {selectedTab === 'Pending' && (
                                    <CardFooter className="p-4 bg-gray-50 flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            className="flex-1 bg-white hover:bg-red-50 border-red-200 text-red-600 text-xs"
                                            onClick={() => handleStatusUpdate(booking.lab_order_id, 'Cancelled')}
                                        >
                                            <XCircle className="w-3 h-3 mr-1" /> Reject
                                        </Button>
                                        <Button 
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-md"
                                            onClick={() => handleStatusUpdate(booking.lab_order_id, 'Accepted')}
                                        >
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Accept Booking
                                        </Button>
                                    </CardFooter>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 italic">No {selectedTab} bookings found</h3>
                        <p className="text-gray-500">When you receive new orders, they will appear here.</p>
                    </div>
                )}
            </Tabs>
        </div>
    );
}

