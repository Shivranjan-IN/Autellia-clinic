import React, { useState } from 'react';
import { 
    Settings, 
    User, 
    Lock, 
    Bell, 
    FileText, 
    ShieldCheck, 
    Building2, 
    Globe, 
    Mail, 
    Phone, 
    MapPin, 
    Save, 
    ShieldAlert, 
    Upload,
    ChevronRight,
    Search,
    BadgeCheck,
    FlaskConical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../common/ui/card';
import { Button } from '../../common/ui/button';
import { Input } from '../../common/ui/input';
import { Label } from '../../common/ui/label';
import { Badge } from '../../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../common/ui/tabs';

export function LabSettings() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-1 shadow-sm">Facility Control Center</h1>
                    <p className="text-gray-500 font-bold italic text-xs uppercase tracking-widest leading-none">Global laboratory configuration, security auditing, and verification status</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 flex items-center gap-2 h-11 px-8 rounded-2xl transform transition-transform active:scale-95 font-black uppercase text-[10px] tracking-widest leading-none border-4 border-blue-500/20">
                        <Save className="w-4 h-4" /> Finalize Global Logic
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 pt-4">
                {/* Left Navigation Card */}
                <Card className="lg:w-80 shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white shrink-0 group border-b-8 border-b-white hover:border-b-blue-600 transition-all">
                     <CardHeader className="bg-gray-900 p-8 pb-10 grow-0 flex flex-col items-center">
                         <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-900 border-4 border-white transform -rotate-6 mb-4 group-hover:rotate-0 transition-transform">
                             <FlaskConical className="w-10 h-10 shadow-inner" />
                         </div>
                         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter shadow-sm mb-1">E-Labs Global</h3>
                         <div className="flex items-center gap-2 mt-1">
                             <div className="p-1 px-2.5 bg-blue-600/20 rounded-full border border-blue-600/30">
                                 <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic flex items-center gap-1"><BadgeCheck className="w-2.5 h-2.5" /> High Security</p>
                             </div>
                         </div>
                     </CardHeader>
                     <CardContent className="p-4 bg-white grow flex flex-col gap-2 pt-8">
                         {[
                             { id: 'profile', icon: Building2, label: 'Facility Profile', active: true },
                             { id: 'security', icon: Lock, label: 'Cyber Protection' },
                             { id: 'notifications', icon: Bell, label: 'System Logic' },
                             { id: 'compliance', icon: FileText, label: 'Diagnostic Trust' },
                             { id: 'connected', icon: Globe, label: 'Partner Sync' },
                         ].map((item, idx) => (
                             <button key={item.id} className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group/btn ${item.active ? 'bg-blue-50 text-blue-600 shadow-inner' : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900'}`}>
                                 <div className="flex items-center gap-3">
                                     <item.icon className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                     <span className="font-black uppercase tracking-widest text-[10px] italic">{item.label}</span>
                                 </div>
                                 {item.active && <ChevronRight className="w-4 h-4 animate-pulse" />}
                             </button>
                         ))}
                     </CardContent>
                     <CardFooter className="p-6 bg-gray-50 flex items-center justify-center">
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic flex items-center gap-1 pointer-events-none transition-colors group-hover:text-blue-600"><ShieldCheck className="w-3.5 h-3.5" /> Ver. 2.4.5.0-LCA</p>
                     </CardFooter>
                </Card>

                {/* Main Settings Content */}
                <Card className="flex-1 shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white group border-t-8 border-t-white hover:border-t-blue-600 transition-all p-1">
                    <Tabs defaultValue="profile" className="w-full h-full flex flex-col">
                        <TabsList className="bg-white p-8 pb-4 h-fit flex items-center justify-start gap-12 rounded-none border-b shadow-none cursor-pointer">
                            <TabsTrigger value="profile" className="px-0 py-2 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                                Global Profile Control
                            </TabsTrigger>
                            <TabsTrigger value="password" className="px-0 py-2 font-black uppercase tracking-widest text-xs italic flex items-center gap-2 border-transparent border-b-4 h-12 transition-all hover:text-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600">
                                Identity & Access
                            </TabsTrigger>
                        </TabsList>

                        <div className="p-10 flex-1 overflow-y-auto">
                            <TabsContent value="profile" className="mt-0 space-y-10 animate-in fade-in duration-700">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     <div className="space-y-6">
                                         <div className="flex items-center gap-10">
                                             <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-300 relative group/photo cursor-pointer shadow-inner overflow-hidden border">
                                                 <Building2 className="w-10 h-10" />
                                                 <div className="absolute inset-0 bg-blue-600/90 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity flex-col">
                                                     <Upload className="w-6 h-6 text-white" />
                                                     <p className="text-[8px] font-black text-white uppercase mt-1">Update</p>
                                                 </div>
                                             </div>
                                             <div className="flex-1">
                                                 <h4 className="font-black text-xl italic uppercase text-gray-900 tracking-tight leading-none mb-1">Facility Identity</h4>
                                                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-2">Public diagnostic institution metadata</p>
                                                 <Badge className="bg-green-50 text-green-700 border-green-200 border uppercase font-black text-[9px] px-3">Fully Verified</Badge>
                                             </div>
                                         </div>

                                         <div className="grid gap-5">
                                             <div className="space-y-2">
                                                 <Label className="text-[10px] items-center gap-1 font-black text-gray-400 uppercase tracking-widest flex">Facility Nomenclature</Label>
                                                 <Input defaultValue="Global Diagnostic Lab" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 focus-visible:ring-blue-600 shadow-sm" />
                                             </div>
                                             <div className="space-y-2">
                                                 <Label className="text-[10px] items-center gap-1 font-black text-gray-400 uppercase tracking-widest flex">Global Communication Logic</Label>
                                                 <Input defaultValue="contact@elab-global.com" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 focus-visible:ring-blue-600 shadow-sm" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-4">
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 uppercase tracking-widest flex">Establishment Epoch</Label>
                                                     <Input defaultValue="2005" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 shadow-sm" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <Label className="text-[10px] items-center gap-1 font-black text-gray-400 uppercase tracking-widest flex">Medical License Key</Label>
                                                     <Input defaultValue="LCA-2005-9981" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 shadow-sm" />
                                                 </div>
                                             </div>
                                         </div>
                                     </div>

                                     <div className="space-y-10">
                                         <div className="p-8 bg-gray-50/50 rounded-3xl border border-transparent hover:border-blue-100 transition-all relative overflow-hidden group/alert cursor-help active:scale-95">
                                             <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover/alert:scale-125 transition-transform group-hover/alert:rotate-12 group-hover/alert:text-orange-600"><ShieldAlert className="w-20 h-20" /></div>
                                             <h4 className="font-black text-lg italic text-orange-600 uppercase tracking-tighter mb-2 flex items-center gap-2 grow-0"><ShieldCheck className="w-5 h-5" /> Security System Alert</h4>
                                             <p className="text-gray-500 font-bold italic text-xs leading-relaxed uppercase tracking-tight">Updating your core facility nomenclature requires secondary blockchain validation. This action will be audited by the regional medical council.</p>
                                             <Button variant="outline" className="mt-4 border-orange-200 text-orange-600 bg-white hover:bg-orange-50 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-sm">Request Authorization</Button>
                                         </div>

                                         <div className="space-y-6">
                                              <h4 className="font-black text-xs uppercase tracking-widest italic text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /> Facility Physical Coordinates</h4>
                                              <div className="grid gap-4">
                                                   <div className="space-y-2">
                                                       <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Address Archive</Label>
                                                       <Input defaultValue="12th Main, Sector 44, Tech Hub, Pune" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 shadow-sm" />
                                                   </div>
                                                   <div className="grid grid-cols-2 gap-4">
                                                       <Input defaultValue="Pune" placeholder="Urban" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 shadow-sm" />
                                                       <Input defaultValue="411045" placeholder="Logic Key" className="h-12 rounded-2xl border-gray-100 italic font-black text-gray-800 shadow-sm" />
                                                   </div>
                                              </div>
                                         </div>
                                     </div>
                                 </div>
                            </TabsContent>
                            
                            <TabsContent value="password" className="mt-0 animate-in slide-in-from-right duration-700">
                                 <div className="max-w-md mx-auto space-y-10 py-10">
                                     <div className="text-center space-y-2">
                                          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mx-auto border-4 border-white shadow-xl shadow-orange-100 mb-4 animate-bounce duration-[3000ms]"><Lock className="w-10 h-10" /></div>
                                          <h4 className="text-2xl font-black italic uppercase text-gray-900 tracking-tighter shadow-sm mb-1">Authorization Matrix Control</h4>
                                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic leading-none transition-colors hover:text-orange-600 cursor-cell">Identity verification and credential rotation</p>
                                     </div>
                                     
                                     <div className="space-y-6 bg-gray-50/50 p-10 rounded-[3rem] border-4 border-dashed border-gray-100 hover:border-orange-500/20 transition-all hover:bg-white hover:shadow-2xl">
                                         <div className="space-y-2">
                                             <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1"><Lock className="w-3 h-3" /> Current Knowledge</Label>
                                             <Input type="password" placeholder="••••••••••••" className="h-14 rounded-2xl border-gray-100 font-extrabold text-lg text-black focus-visible:ring-orange-500 shadow-inner" />
                                         </div>
                                         <div className="space-y-2">
                                             <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-1"><Lock className="w-3 h-3" /> New Knowledge Architecture</Label>
                                             <Input type="password" placeholder="••••••••••••" className="h-14 rounded-2xl border-gray-100 font-extrabold text-lg text-black focus-visible:ring-orange-500" />
                                         </div>
                                         <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black uppercase text-[10px] tracking-widest h-14 rounded-2xl shadow-xl shadow-orange-100 transform active:scale-95 transition-all mt-4 leading-none border-4 border-orange-500/30">
                                             Rotate Authorization Tokens
                                         </Button>
                                     </div>
                                     
                                     <div className="p-8 border-2 border-dashed rounded-3xl flex items-center gap-6 cursor-not-allowed opacity-40 group/mfa grayscale hover:grayscale-0 transition-all">
                                         <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 grow-0 shrink-0"><ShieldCheck className="w-10 h-10" /></div>
                                         <div className="text-left">
                                             <h4 className="font-black text-gray-900 uppercase italic tracking-tighter mb-1">Biometric / MFA Shield</h4>
                                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic leading-tight">Advanced authentication layer is currently restricted to Lab Admins only.</p>
                                         </div>
                                     </div>
                                 </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </Card>
            </div>
        </div>
    );
}
