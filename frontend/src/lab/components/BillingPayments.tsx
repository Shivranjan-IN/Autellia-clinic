import { useState, useEffect } from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    FileText, 
    CreditCard, 
    Download, 
    Plus, 
    Search,
    ChevronRight,
    ArrowUpRight,
    Activity,
    Calendar,
    BadgeCheck,
    Clock,
    User,
    ArrowDownLeft,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function BillingPayments() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        revenue: '₹0',
        pending: '₹0',
        settled: '₹0',
        count: 0
    });

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await labService.getBookings();
            if (res.success) {
                const data = res.data;
                setTransactions(data);

                // Calculate stats
                let totalRev = 0;
                let totalPending = 0;
                data.forEach((tx: any) => {
                    const price = parseFloat(tx.price || 0);
                    if (tx.payment_status === 'Paid') totalRev += price;
                    else if (tx.payment_status === 'Pending') totalPending += price;
                });

                setStats({
                    revenue: `₹${totalRev.toLocaleString()}`,
                    pending: `₹${totalPending.toLocaleString()}`,
                    settled: `₹${(totalRev * 0.9).toLocaleString()}`, // Mock settlement logic
                    count: data.length
                });
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.order_id?.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 italic">Lab Financial Dashboard</h1>
                    <p className="text-gray-600 font-medium">Manage earnings, generate invoices, and track diagnostic transaction history</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2 h-11 border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-50">
                        <Download className="w-4 h-4" /> Settlement Report
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 h-11 px-6 shadow-blue-100 italic font-black uppercase tracking-widest text-[10px]">
                        <Plus className="w-4 h-4" /> Create Manual Invoice
                    </Button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Net Revenue Accrued', value: stats.revenue, icon: DollarSign, color: 'blue', change: '+System Log' },
                    { label: 'Pending Collections', value: stats.pending, icon: Clock, color: 'orange', change: 'Outstanding' },
                    { label: 'Settled to Banks', value: stats.settled, icon: BadgeCheck, color: 'green', change: 'Audit Ready' },
                    { label: 'Transaction Pipeline', value: stats.count.toString(), icon: Activity, color: 'purple', change: 'Active Records' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white border-blue-50/50 hover:shadow-xl transition-all group overflow-hidden">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none font-mono mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-gray-900 italic transform transition-transform group-hover:scale-110 origin-left leading-none">{stat.value}</h3>
                                <div className="flex items-center gap-1 mt-1">
                                    <div className={`w-1 h-3 rounded-full bg-${stat.color}-500`} />
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight italic">{stat.change}</p>
                                </div>
                            </div>
                            <div className={`w-12 h-12 rounded-full bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 grow-0 shrink-0 shadow-inner group-hover:rotate-12 transition-transform`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Transaction Ledger */}
                <Card className="lg:col-span-2 shadow-xl border-blue-50 overflow-hidden bg-white">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b bg-gray-50/50">
                        <div className="flex items-center gap-2">
                             <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-200"><CreditCard className="w-4 h-4" /></div>
                             <CardTitle className="text-lg uppercase italic font-black text-gray-900">Recent Ledger Transactions</CardTitle>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 font-black" />
                            <Input 
                                placeholder="Search invoice history..." 
                                className="pl-10 h-10 text-xs shadow-sm bg-white" 
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
                            ) : filteredTransactions.length > 0 ? (
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-bold border-b uppercase tracking-widest text-[10px]">
                                        <tr>
                                            <th className="px-6 py-4 italic">Invoice ID</th>
                                            <th className="px-6 py-4 italic">Patient / Test</th>
                                            <th className="px-6 py-4 italic">Datetime</th>
                                            <th className="px-6 py-4 italic">Gateway / Mode</th>
                                            <th className="px-6 py-4 italic text-right">Settled Amount</th>
                                            <th className="px-6 py-4 italic text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-left">
                                        {filteredTransactions.map((tx) => (
                                            <tr key={tx.order_id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                                                <td className="px-6 py-4 font-black text-gray-900">INV-{tx.order_id}</td>
                                                <td className="px-6 py-4 min-w-[150px]">
                                                    <div className="flex flex-col gap-1 text-left">
                                                        <span className="font-black text-gray-800 flex items-center gap-1 group-hover:text-blue-600 transition-colors uppercase italic text-[10px]"><User className="w-3 h-3 text-gray-400" /> {tx.patient_name}</span>
                                                        <span className="text-[9px] text-gray-400 font-black italic tracking-widest uppercase border-l border-blue-600 pl-1">{tx.test_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col font-bold text-gray-500 gap-0.5 text-left">
                                                        <span className="flex items-center gap-1 text-[10px] uppercase italic font-black leading-none"><Calendar className="w-3 h-3" /> {new Date(tx.created_at).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-1 text-[9px] uppercase italic font-bold opacity-50"><Clock className="w-3 h-3" /> {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="font-black text-[8px] uppercase tracking-tighter bg-white border-blue-100 text-blue-600 px-2 py-0.5 flex w-fit gap-1 items-center italic">
                                                        <TrendingUp className="w-2 h-2" /> Digital Settlement
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-gray-900 italic transform group-hover:scale-110 origin-right transition-transform block">₹{parseFloat(tx.price || 0).toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        {tx.payment_status === 'Paid' ? (
                                                            <Badge className="bg-green-50 text-green-700 border-green-200 border uppercase font-black text-[9px] tracking-widest px-2 shadow-sm italic"><ArrowDownLeft className="w-3 h-3 mr-1" /> PAID</Badge>
                                                        ) : tx.payment_status === 'Failed' ? (
                                                            <Badge className="bg-red-50 text-red-700 border-red-200 border uppercase font-black text-[9px] tracking-widest px-2 italic"><AlertCircle className="w-3 h-3 mr-1" /> FAILED</Badge>
                                                        ) : (
                                                            <Badge className="bg-orange-50 text-orange-700 border-orange-200 border uppercase font-black text-[9px] tracking-widest px-2 animate-pulse font-mono flex items-center gap-1 italic"><Clock className="w-3 h-3" /> PENDING</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-20 italic">
                                     <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                     <h3 className="text-lg font-bold text-gray-400 italic">No financial ledger entries found</h3>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <div className="p-4 bg-gray-50 border-t flex justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-600 font-black uppercase tracking-widest text-[9px] flex items-center gap-2 hover:bg-transparent p-0 italic">
                            Access Full Transaction History <ArrowUpRight className="w-4 h-4" />
                        </Button>
                    </div>
                </Card>

                {/* Secondary Cards Column */}
                <div className="space-y-6">
                    <Card className="shadow-lg border-blue-50 border-t-4 border-t-blue-600 overflow-hidden text-left bg-white">
                        <CardHeader className="pb-2">
                             <div className="flex justify-between items-center mb-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Growth Analytics</p>
                                <TrendingUp className="w-4 h-4 text-green-500 animate-bounce" />
                             </div>
                             <CardTitle className="text-lg font-black italic uppercase leading-none">M-o-M Revenue</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-24 flex items-end gap-1 px-4 mt-2">
                                {[30, 45, 25, 60, 40, 80, 55, 90, 35, 75].map((h, idx) => (
                                    <div key={idx} 
                                        className="w-full bg-blue-100 hover:bg-blue-600 transition-colors rounded-t cursor-pointer relative group" 
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap z-10 font-mono italic">₹{h * 10 }k</div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-dashed border-blue-200 space-y-1">
                                <div className="flex justify-between items-center mb-2 text-left">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Next Settlement Date</p>
                                    <Badge variant="outline" className="text-[8px] font-black text-gray-500 uppercase border-gray-200 bg-white">System Auto</Badge>
                                </div>
                                <div className="flex items-center justify-between text-left">
                                    <span className="text-lg font-black text-blue-900 italic transform hover:scale-105 transition-transform origin-left">30th March, 2024</span>
                                    <p className="text-xs font-black text-green-600 italic leading-none border-b-2 border-green-100">Expected: ₹54k</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-blue-50 bg-white">
                        <CardHeader className="p-4 border-b">
                            <CardTitle className="text-md font-black italic uppercase flex items-center gap-2 text-gray-900 leading-none">
                                <FileText className="w-4 h-4 text-orange-600" /> Linked Tax Profiles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                             <div className="flex items-center justify-between group cursor-pointer text-left">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner"><FileText className="w-5 h-5" /></div>
                                     <div className="text-left">
                                         <p className="text-sm font-black text-gray-800 uppercase tracking-widest italic leading-none mb-1">GST Certificate</p>
                                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1 group-hover:text-blue-600 transition-colors ml-1"><BadgeCheck className="w-3 h-3 text-green-500" /> Verified Active</p>
                                     </div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                             </div>
                             <div className="flex items-center justify-between group cursor-pointer text-left">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-inner"><CreditCard className="w-5 h-5" /></div>
                                     <div className="text-left">
                                         <p className="text-sm font-black text-gray-800 uppercase tracking-widest italic leading-none mb-1">PAN DATABASE</p>
                                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1 group-hover:text-blue-600 transition-colors ml-1"><BadgeCheck className="w-3 h-3 text-green-500" /> Linked Account</p>
                                     </div>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

