import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    ShieldCheck, 
    Activity, 
    Mail, 
    Phone, 
    BadgeCheck, 
    Search, 
    MoreVertical,
    Trash2,
    Briefcase,
    Globe,
    Lock,
    ChevronRight,
    ArrowUpRight,
    Star,
    Edit2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import labService from '../../services/labService';

export function StaffManagement() {
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const res = await labService.getStaff();
            if (res.success) {
                setStaff(res.data);
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter(s => 
        s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-1">Facility Human Capital</h1>
                    <p className="text-gray-500 font-bold italic text-xs uppercase tracking-widest leading-none">Manage technical shifts, security clearances, and operational staff roles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex items-center gap-2 h-11 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest border-blue-100 text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition-all shadow-blue-50 border shadow-inner active:scale-95 leading-none">
                        <Lock className="w-4 h-4" /> Shift Logs
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 flex items-center gap-2 h-11 px-8 rounded-2xl transform transition-transform active:scale-95 font-black uppercase text-[10px] tracking-widest leading-none border-4 border-blue-500/20">
                        <UserPlus className="w-4 h-4" /> Onboard Talent
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {[
                    { label: 'Active Roster', value: filteredStaff.length, icon: Users, color: 'blue', change: 'Total Employees' },
                    { label: 'On Shift Now', value: filteredStaff.filter(s => s.is_active).length, icon: Activity, color: 'green', change: 'Current Presence' },
                    { label: 'Leave Requests', value: 0, icon: Globe, color: 'orange', change: 'Pending Approval' },
                    { label: 'System Admins', value: filteredStaff.filter(s => s.role === 'Admin').length, icon: ShieldCheck, color: 'purple', change: 'Restricted Access' },
                ].map((stat, idx) => (
                    <Card key={idx} className="bg-white hover:shadow-2xl transition-all group overflow-hidden border-none shadow-xl rounded-3xl">
                        <CardContent className="p-6 flex items-center justify-between relative h-28">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-x-4 translate-y-4 -z-10 group-hover:scale-110 transition-transform" />
                             <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black text-gray-900 italic transform transition-transform group-hover:scale-110 origin-left">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic flex items-center gap-1"><BadgeCheck className="w-3 h-3 text-blue-500" /> {stat.change}</p>
                             </div>
                             <div className={`w-14 h-14 rounded-3xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 grow-0 shrink-0 transform -rotate-12 group-hover:rotate-0 transition-transform shadow-xl shadow-${stat.color}-100/50`}>
                                 <stat.icon className="w-7 h-7" />
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white mt-8 group border-t-8 border-t-white hover:border-t-blue-600 transition-all">
                <CardHeader className="flex flex-row items-center justify-between p-8 pb-4 border-none">
                     <div className="flex items-center gap-3">
                         <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-2xl shadow-gray-400 group-hover:scale-110 transition-transform"><Briefcase className="w-6 h-6" /></div>
                         <CardTitle className="text-2xl font-black uppercase italic tracking-tighter">Verified Professionals</CardTitle>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="relative w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 font-black" />
                            <Input 
                                placeholder="Search employee database..." 
                                className="pl-12 h-12 text-sm font-bold uppercase p-0 border-none bg-gray-50 rounded-2xl shadow-inner focus-visible:ring-blue-600" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="p-3.5 bg-gray-50 hover:bg-100 rounded-xl transition-colors border shadow-sm group-hover:text-blue-600"><MoreVertical className="w-5 h-5" /></button>
                     </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto text-left">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : filteredStaff.length > 0 ? (
                            <table className="w-full text-sm text-left px-8">
                                <thead className="bg-gray-50/50 text-gray-400 font-black border-b uppercase tracking-widest text-[10px] italic">
                                    <tr>
                                        <th className="px-10 py-5">Profile Archive</th>
                                        <th className="px-6 py-5">Role Designation</th>
                                        <th className="px-6 py-5">Contact Details</th>
                                        <th className="px-6 py-5">Recent Presence</th>
                                        <th className="px-6 py-5 text-center">Status Power</th>
                                        <th className="px-6 py-5">Security Level</th>
                                        <th className="px-10 py-5 text-right">Records</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 pb-8 text-left">
                                    {filteredStaff.map((person) => (
                                        <tr key={person.id} className="hover:bg-blue-50/30 transition-all cursor-pointer group/row relative">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex flex-col items-center justify-center text-gray-300 font-black text-2xl shadow-inner shrink-0 group-hover/row:scale-110 transition-transform border uppercase">
                                                        {person.full_name?.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-black text-lg text-gray-900 leading-tight uppercase italic group-hover/row:text-blue-600 transition-colors truncate">{person.full_name}</h3>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 group-hover/row:text-gray-500"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> ID: {person.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <Badge variant="outline" className="border-gray-200 text-gray-900 font-black uppercase tracking-widest text-[10px] px-3 py-1 italic bg-white shadow-sm group-hover/row:border-blue-300 group-hover/row:text-blue-600 transition-colors">{person.role || 'Staff'}</Badge>
                                            </td>
                                            <td className="px-6 py-6 font-bold text-gray-500 space-y-1">
                                                <p className="flex items-center gap-2 text-xs leading-none group-hover/row:text-gray-900 transition-colors"><Mail className="w-3.5 h-3.5 text-blue-500" /> {person.email || 'N/A'}</p>
                                                <p className="flex items-center gap-2 text-xs leading-none group-hover/row:text-gray-900 transition-colors"><Phone className="w-3.5 h-3.5 text-blue-500" /> {person.phone || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-6 text-left">
                                                <p className="text-xs font-black text-gray-900 italic transform transition-transform group-hover/row:scale-110 origin-left">{new Date(person.created_at).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1 leading-none mt-1"><Search className="w-3 h-3" /> Historical Logs</p>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className="flex justify-center group/badge">
                                                    <Badge className={`uppercase font-black text-[9px] tracking-widest px-4 py-1.5 rounded-full shadow-lg transition-all ${
                                                        person.is_active ? 'bg-green-100 text-green-700 border-green-200 border group-hover/row:bg-green-600 group-hover/row:text-white group-hover/row:border-green-600 shadow-green-100' : 'bg-red-100 text-red-700 border-red-200 border group-hover/row:bg-red-600 group-hover/row:text-white group-hover/row:border-red-600 shadow-red-100'
                                                    }`}>
                                                        {person.is_active ? 'active' : 'inactive'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1 items-start">
                                                     <div className="flex gap-1">
                                                         {[1, 2, 3].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
                                                     </div>
                                                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Level 2 Clear</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                    <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-blue-100 text-blue-600 hover:shadow-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                                                    <button className="p-3 hover:bg-white rounded-2xl border border-transparent hover:border-red-100 text-red-600 hover:shadow-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    <button className="p-3 hover:bg-blue-600 rounded-2xl text-gray-300 hover:text-white transition-all shadow-none hover:shadow-2xl"><ChevronRight className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-20 bg-gray-50/50">
                                <Users className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-400 italic">No staff found in records</h3>
                            </div>
                        )}
                    </div>
                </CardContent>
                <div className="p-8 bg-gray-50 border-t flex justify-end">
                    <Button variant="ghost" className="text-blue-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-transparent group/btn">
                        Access Complete Employee Knowledge Base <ArrowUpRight className="w-5 h-5 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </Button>
                </div>
            </Card>
        </div>
    );
}



