import React, { useState, useEffect } from 'react';
import { 
    Building2, 
    Link, 
    CheckCircle, 
    XCircle, 
    MoreVertical, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar,
    ArrowUpRight,
    Users,
    FlaskConical,
    Activity,
    Search,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/ui/tabs';
import labService from '../../services/labService';

export function ClinicConnections() {
    const [connections, setConnections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const res = await labService.getClinicConnections();
            if (res.success) {
                setConnections(res.data);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConnections = connections.filter(c => 
        c.clinics?.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 italic">Clinic Network & Referral Partners</h1>
                    <p className="text-gray-600 font-medium">Manage your professional network, connected medical centers, and incoming partnership requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2">
                        <Link className="w-4 h-4" /> Discover Potential Partners
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input 
                        placeholder="Filter by clinic name..." 
                        className="pl-10 h-11 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="outline" className="flex items-center gap-2 h-11 px-6 bg-white"><Activity className="w-4 h-4" /> Global Mapping Reports</Button>
                </div>
            </div>

            <Tabs defaultValue="active" className="w-full">
                <TabsList className="bg-white border p-1 rounded-xl shadow-sm mb-6">
                    <TabsTrigger value="active" className="px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 font-bold uppercase tracking-widest text-xs">
                         Connected Clinics ({filteredConnections.length})
                    </TabsTrigger>
                    <TabsTrigger value="requests" className="px-6 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 font-bold uppercase tracking-widest text-xs">
                         Mapping Requests (0)
                    </TabsTrigger>
                    <TabsTrigger value="archived" className="px-6 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-600 font-bold uppercase tracking-widest text-xs">
                         Disconnected
                    </TabsTrigger>
                </TabsList>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Activity className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <TabsContent value="active" className="mt-0">
                        {filteredConnections.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredConnections.map((conn) => (
                                    <Card key={conn.mapping_id} className="group hover:shadow-2xl hover:border-blue-600 transition-all text-left relative overflow-hidden bg-white border-blue-50">
                                        <CardHeader className="p-4 pb-2 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                                <ShieldCheck className="w-3 h-3 text-blue-500" /> Mapping ID: {conn.mapping_id}
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button>
                                        </CardHeader>
                                        <CardContent className="p-5 space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 rounded-3xl bg-blue-600 flex flex-col items-center justify-center text-white font-black text-2xl shadow-xl shadow-blue-100 shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform">
                                                    <Building2 className="w-7 h-7" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors uppercase truncate text-lg">{conn.clinics?.clinic_name}</h3>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-black tracking-widest uppercase italic mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded-full">
                                                        <Briefcase className="w-3 h-3" /> Reg: {conn.clinics?.medical_council_reg_no || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 py-3 border-y border-dashed mt-2">
                                                <div className="flex items-center gap-3 text-sm text-gray-700 font-bold">
                                                    <div className="p-1.5 rounded-lg bg-gray-100 shadow-sm"><MapPin className="w-3 h-3" /></div>
                                                    <span className="truncate">{conn.clinics?.address || 'Address Not Found'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] items-center gap-1 font-bold text-gray-400 uppercase tracking-widest flex"><Calendar className="w-3 h-3" /> Connected Since</p>
                                                    <p className="text-sm font-black text-gray-700 italic">{new Date(conn.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] justify-end font-bold items-center gap-1 text-gray-400 uppercase tracking-widest flex"><FlaskConical className="w-3 h-3" /> Samples Log</p>
                                                    <p className="text-2xl font-black text-blue-600 italic leading-none">0</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-0 border-t">
                                             <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] h-11 flex items-center justify-between px-6 rounded-none group/btn">
                                                 Analysis Mapping Details <ArrowUpRight className="w-4 h-4 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                             </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 italic">No Connected Clinics</h3>
                                <p className="text-gray-500">Discover partners or invite clinics to start receiving orders.</p>
                            </div>
                        )}
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

