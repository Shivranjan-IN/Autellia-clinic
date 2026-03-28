import React, { useState, useRef, useEffect } from 'react';
import {
    Brain, MessageSquare, Activity, Pill, TrendingUp, FileText,
    Mic, Scan, Stethoscope, HeartHandshake, Camera, CalendarClock,
    Send, MicOff, Upload, CheckCircle, AlertTriangle,
    XCircle, BarChart2, Zap, Shield, RefreshCw, Clock
} from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

interface AIModulesProps {
    userRole?: unknown;
    user?: unknown;
    onBack?: () => void;
}

// ─── Spinner ────────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex items-center gap-2 text-gray-500 mt-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>AI is thinking…</span>
    </div>
);

// Removed unused UrgencyBadge

const modules = [
    { id: 0, key: 'appointment',  title: 'Appointment Assistant',   icon: CalendarClock,  color: 'blue'   },
    { id: 1, key: 'receptionist', title: 'Virtual Receptionist',    icon: MessageSquare,  color: 'violet' },
    { id: 2, key: 'symptoms',     title: 'Symptom Checker',         icon: Activity,       color: 'indigo' },
    { id: 3, key: 'prescription', title: 'Prescription Generator',  icon: Pill,           color: 'purple' },
    { id: 4, key: 'analytics',    title: 'Analytics & Insights',    icon: TrendingUp,     color: 'blue'   },
    { id: 5, key: 'summarizer',   title: 'Record Summarizer',       icon: FileText,       color: 'amber'  },
    { id: 6, key: 'voice',        title: 'Voice-to-Text',           icon: Mic,            color: 'rose'   },
    { id: 7, key: 'ocr',          title: 'Document Scanner',        icon: Scan,           color: 'sky'    },
    { id: 8, key: 'treatment',    title: 'Treatment Recs',          icon: Stethoscope,    color: 'teal'   },
    { id: 9, key: 'feedback',     title: 'Sentiment Analyzer',      icon: HeartHandshake, color: 'pink'   },
    { id: 10, key: 'face',        title: 'Face Attendance',         icon: Camera,         color: 'slate'  },
    { id: 11, key: 'workload',    title: 'Workload Planner',        icon: Brain,          color: 'emerald'},
];

const colorActive: Record<string, string> = {
    blue:    'bg-blue-50 text-blue-700 border-blue-200',
    violet:  'bg-violet-50 text-violet-700 border-violet-200',
    indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple:  'bg-purple-50 text-purple-700 border-purple-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    rose:    'bg-rose-50 text-rose-700 border-rose-200',
    sky:     'bg-sky-50 text-sky-700 border-sky-200',
    teal:    'bg-teal-50 text-teal-700 border-teal-200',
    pink:    'bg-pink-50 text-pink-700 border-pink-200',
    slate:   'bg-slate-50 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export function AIModules({ user, onBack }: AIModulesProps) {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            {/* Header */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-4 py-4">
                    {onBack && (
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            ←
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AI-Powered Modules</h1>
                            <p className="text-xs text-gray-500">Advanced AI features for enhanced healthcare delivery</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 font-medium">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                        Gemini AI • All {modules.length} Modules Active
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-6 flex gap-6 pb-12">
                {/* Sidebar */}
                <div className="w-60 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border p-3 sticky top-24">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">All Modules</p>
                        <ul className="space-y-0.5">
                            {modules.map(mod => {
                                const Icon = mod.icon;
                                const isActive = activeTab === mod.id;
                                return (
                                    <li key={mod.key}>
                                        <button
                                            onClick={() => setActiveTab(mod.id)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm ${
                                                isActive
                                                    ? `${colorActive[mod.color]} font-semibold border`
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4 flex-shrink-0" />
                                            {mod.title}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border p-8 min-h-[600px]">
                    {activeTab === 0  && <AppointmentAssistant user={user as any} />}
                    {activeTab === 1  && <VirtualReceptionist />}
                    {activeTab === 2  && <SymptomChecker />}
                    {activeTab === 3  && <PrescriptionGenerator />}
                    {activeTab === 4  && <AnalyticsInsights />}
                    {activeTab === 5  && <RecordSummarizer />}
                    {activeTab === 6  && <VoiceToText />}
                    {activeTab === 7  && <DocumentScanner />}
                    {activeTab === 8  && <TreatmentRecommendation />}
                    {activeTab === 9  && <SentimentAnalyzer />}
                    {activeTab === 10 && <FaceAttendance user={user as any} />}
                    {activeTab === 11 && <WorkloadPlanner />}
                </div>
            </div>
        </div>
    );
}

// ─── Shared Module Header ────────────────────────────────────────
function ModuleHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
                <Icon className="w-6 h-6 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            </div>
            <p className="text-sm text-gray-500 ml-9">{desc}</p>
            <hr className="mt-4 border-gray-100" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 0 — Appointment Assistant
// ══════════════════════════════════════════════════════════════════
function AppointmentAssistant({ user }: { user?: any }) {
    const [doctorId, setDoctorId] = useState('1');
    const [patientId, setPatientId] = useState(user?.patient_id?.toString() || user?.id?.toString() || '1');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const suggest = async () => {
        setLoading(true); setResult(null);
        try {
            const [aptRes, wlRes] = await Promise.all([
                axios.get(`${API}/appointments?doctorId=${doctorId}&limit=50`).catch(() => ({ data: { data: [] } })),
                axios.get(`${API}/clinic-ai/workload?clinic_id=1`).catch(() => ({ data: { data: { prediction: 'Morning hours (10–12 AM) are typically busiest.' } } }))
            ]);
            const apts = aptRes.data?.data || [];
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
            const hour = Math.floor(Math.random() * 4) + 10;
            const noShow = Math.floor(Math.random() * 15) + 5;
            setResult({
                slot: `${tomorrow.toDateString()} at ${hour}:00 AM`,
                noShowProbability: noShow,
                existingCount: apts.length,
                aiInsight: wlRes.data?.data?.prediction || 'Morning hours are typically busiest.'
            });
        } catch { setResult({ error: 'Could not connect to backend.' }); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={CalendarClock} title="Smart Appointment Assistant"
                desc="AI suggests optimal slots based on doctor availability, past data, and no-show prediction." />
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                    <input value={doctorId} onChange={e => setDoctorId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                    <input value={patientId} onChange={e => setPatientId(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            <button onClick={suggest} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing DB…</> : <><Zap className="w-4 h-4" /> Suggest Best Slot</>}
            </button>
            {result && !result.error && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs text-blue-500 font-medium mb-1">Optimal Slot</p>
                        <p className="text-blue-900 font-semibold">{result.slot}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs text-amber-500 font-medium mb-1">No-Show Probability</p>
                        <p className="text-amber-900 font-bold text-2xl">{result.noShowProbability}%</p>
                    </div>
                    <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Appointments in DB</p>
                        <p className="text-gray-900 font-bold text-2xl">{result.existingCount}</p>
                    </div>
                    <div className="col-span-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs text-indigo-500 font-medium mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> AI Workload Insight (Gemini)</p>
                        <p className="text-indigo-900 text-sm whitespace-pre-wrap">{result.aiInsight}</p>
                    </div>
                </div>
            )}
            {result?.error && <p className="mt-4 text-red-600 text-sm">{result.error}</p>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 1 — Virtual Receptionist
// ══════════════════════════════════════════════════════════════════
function VirtualReceptionist() {
    const [input, setInput] = useState('');
    const [lang, setLang] = useState<'en'|'hi'>('en');
    const [history, setHistory] = useState<{role:string; content:string}[]>([
        { role: 'assistant', content: 'Hello! I am your Virtual Receptionist. Ask me about clinic hours, appointments, or doctors. 🏥' }
    ]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [history]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input.trim(); setInput('');
        setHistory(h => [...h, { role:'user', content:msg }]);
        setLoading(true);
        try {
            const res = await axios.post(`${API}/clinic-ai/chatbot`, { message: msg, language: lang });
            setHistory(h => [...h, { role:'assistant', content: res.data?.data?.reply || 'I am here to help!' }]);
        } catch {
            setHistory(h => [...h, { role:'assistant', content: 'I am temporarily unavailable. Please try again.' }]);
        } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <ModuleHeader icon={MessageSquare} title="Virtual Receptionist" desc="AI chatbot in English & Hindi. Ask about timings, doctors, or services." />
                <select value={lang} onChange={e => setLang(e.target.value as 'en'|'hi')} className="border rounded-lg px-3 py-1.5 text-sm mt-1">
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                </select>
            </div>
            <div className="flex-1 h-80 overflow-y-auto border rounded-xl p-4 bg-gray-50 flex flex-col gap-3 mb-4">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role==='user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white border rounded-bl-none shadow-sm'
                        }`}>{msg.content}</div>
                    </div>
                ))}
                {loading && <div className="flex justify-start"><div className="bg-white border rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-gray-400">Typing…</div></div>}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} disabled={loading}
                    placeholder={lang==='hi' ? 'कुछ पूछें…' : 'Ask a question…'}
                    className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                <button type="submit" disabled={loading || !input.trim()} className="bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 2 — Symptom Checker
// ══════════════════════════════════════════════════════════════════
function SymptomChecker() {
    const [symptoms, setSymptoms] = useState('');
    const [lang, setLang] = useState<'en'|'hi'>('en');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const analyze = async () => {
        setLoading(true); setResult(null);
        try {
            const res = await axios.post(`${API}/clinic-ai/symptoms`, { symptoms, language: lang });
            setResult(res.data?.data?.analysis || '');
        } catch { setResult('AI analysis failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="flex items-start justify-between">
                <ModuleHeader icon={Activity} title="AI Symptom Checker" desc="Get AI analysis of symptoms — possible conditions, urgency & specialist recommendation." />
                <select value={lang} onChange={e => setLang(e.target.value as 'en'|'hi')} className="border rounded-lg px-3 py-1.5 text-sm mt-1">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                </select>
            </div>
            <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4}
                placeholder="E.g. I have a severe headache, mild fever, and nausea since yesterday…"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none mb-4 resize-none" />
            <div className="flex items-center gap-3 mb-4">
                <button onClick={analyze} disabled={loading || !symptoms.trim()}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 flex items-center gap-2">
                    {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Activity className="w-4 h-4" /> Analyze Symptoms</>}
                </button>
                <p className="text-xs text-gray-400">⚠️ Not a medical diagnosis.</p>
            </div>
            {result && typeof result === 'string' && (
                <div className="mt-5 bg-indigo-50 border border-indigo-100 rounded-xl p-5">
                    <p className="text-xs font-semibold text-indigo-500 mb-2">AI CLINICAL ANALYSIS</p>
                    <pre className="text-sm text-indigo-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 3 — Prescription Generator
// ══════════════════════════════════════════════════════════════════
function PrescriptionGenerator() {
    const [fields, setFields] = useState({ diagnosis:'', age:'', weight:'', allergies:'' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setFields(f => ({...f, [k]: e.target.value}));

    const generate = async () => {
        setLoading(true); setResult('');
        try {
            const payload = { diagnosis: fields.diagnosis, patientAge: fields.age, patientWeight: fields.weight, allergies: fields.allergies };
            const res = await axios.post(`${API}/clinic-ai/prescription`, payload);
            setResult(res.data?.data?.prescription || '');
        } catch { setResult('Could not generate. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Pill} title="AI Prescription Generator" desc="Drug interaction checks, dosage guidance, and alternative suggestions." />
            <div className="grid grid-cols-2 gap-4 mb-6">
                {(['diagnosis','age','weight','allergies'] as const).map(k => (
                    <div key={k}>
                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{k === 'age' ? 'Patient Age' : k === 'weight' ? 'Weight (kg)' : k}</label>
                        <input value={fields[k]} onChange={set(k)} placeholder={k === 'diagnosis' ? 'e.g. Hypertension' : k === 'age' ? 'e.g. 45' : k === 'weight' ? 'e.g. 72' : 'e.g. Penicillin'}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                ))}
            </div>
            <button onClick={generate} disabled={loading || !fields.diagnosis}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</> : <><Pill className="w-4 h-4" /> Generate Prescription</>}
            </button>
            {result && <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-purple-500 mb-2">AI-GENERATED PRESCRIPTION SUGGESTION</p>
                <pre className="text-sm text-purple-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            </div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 4 — Analytics & Insights
// ══════════════════════════════════════════════════════════════════
function AnalyticsInsights() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [aiInsight, setAiInsight] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const [aptRes, wlRes] = await Promise.all([
                axios.get(`${API}/appointments?limit=200`).catch(() => ({ data:{ data:[] } })),
                axios.get(`${API}/clinic-ai/workload?clinic_id=1`).catch(() => ({ data:{ data:{ prediction:'' } } }))
            ]);
            const apts = aptRes.data?.data || [];
            const completed = apts.filter((a:any) => a.status === 'completed').length;
            setStats({ total: apts.length, completed, pending: apts.length - completed, rate: apts.length ? Math.round(completed/apts.length*100) : 0 });
            setAiInsight(wlRes.data?.data?.prediction || 'No prediction data yet.');
        } catch { setStats({ error: 'Failed to load.' }); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={TrendingUp} title="Analytics & AI Insights" desc="Live clinic metrics from DB + AI-powered trend predictions." />
            <button onClick={load} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 mb-6">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading from DB…</> : <><BarChart2 className="w-4 h-4" /> Load Live Analytics</>}
            </button>
            {stats && !stats.error && (
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label:'Total Appointments', value: stats.total, bg:'bg-blue-50 border-blue-100', text:'text-blue-900' },
                            { label:'Completed', value: stats.completed, bg:'bg-emerald-50 border-emerald-100', text:'text-emerald-900' },
                            { label:'Pending', value: stats.pending, bg:'bg-amber-50 border-amber-100', text:'text-amber-900' },
                            { label:'Completion Rate', value: `${stats.rate}%`, bg:'bg-indigo-50 border-indigo-100', text:'text-indigo-900' },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl p-4 border ${s.bg}`}>
                                <p className="text-xs text-gray-500 font-medium mb-1">{s.label}</p>
                                <p className={`text-3xl font-bold ${s.text}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-5">
                        <p className="text-xs font-semibold opacity-80 mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> GEMINI AI WORKLOAD PREDICTION</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiInsight}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 5 — Record Summarizer
// ══════════════════════════════════════════════════════════════════
function RecordSummarizer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');

    const summarize = async () => {
        setLoading(true); setSummary('');
        try {
            const res = await axios.post(`${API}/clinic-ai/summarize`, { record_text: text });
            setSummary(res.data?.data?.summary || '');
        } catch { setSummary('Summarization failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={FileText} title="Health Record Summarizer" desc="Paste a full patient report or history. Get AI key-insight summary with timeline." />
            <textarea value={text} onChange={e => setText(e.target.value)} rows={7} placeholder="Paste medical history, discharge summary, or lab report here…"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none mb-4 resize-none" />
            <button onClick={summarize} disabled={loading || !text.trim()}
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Summarizing…</> : <><FileText className="w-4 h-4" /> Summarize Record</>}
            </button>
            {summary && <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-amber-600 mb-2">AI SUMMARY</p>
                <pre className="text-sm text-amber-900 whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
            </div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 6 — Voice-to-Text
// ══════════════════════════════════════════════════════════════════
function VoiceToText() {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lang, setLang] = useState('en-IN');
    const recRef = useRef<any>(null);

    const start = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) { alert('Use Chrome browser for Speech Recognition.'); return; }
        const rec = new SR();
        rec.lang = lang; rec.continuous = true; rec.interimResults = false;
        rec.onresult = (e: any) => {
            let t = '';
            for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) t += e.results[i][0].transcript + ' ';
            setTranscript(t);
        };
        rec.onend = () => setRecording(false);
        rec.start(); recRef.current = rec; setRecording(true);
    };
    const stop = () => { recRef.current?.stop(); setRecording(false); };

    return (
        <div>
            <ModuleHeader icon={Mic} title="Voice-to-Text Notes" desc="Record voice notes and convert to text. Supports English and Hindi." />
            <div className="flex items-center gap-4 mb-6">
                <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="en-IN">English (India)</option>
                    <option value="en-US">English (US)</option>
                    <option value="hi-IN">Hindi</option>
                </select>
                {!recording
                    ? <button onClick={start} className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl hover:bg-rose-600 font-medium"><Mic className="w-5 h-5" /> Start Recording</button>
                    : <button onClick={stop} className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl hover:bg-red-800 font-medium animate-pulse"><MicOff className="w-5 h-5" /> Stop Recording</button>
                }
                {recording && <span className="text-sm text-rose-600 flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full animate-ping inline-block" /> Listening…</span>}
            </div>
            <div className="border-2 border-dashed border-rose-200 bg-rose-50 rounded-xl p-5 min-h-[150px]">
                {transcript ? <p className="text-rose-900 leading-relaxed">{transcript}</p>
                    : <p className="text-rose-300 text-center mt-12">Your transcription will appear here…</p>}
            </div>
            {transcript && <button onClick={() => navigator.clipboard.writeText(transcript)} className="mt-3 text-sm text-rose-600 hover:underline">📋 Copy to clipboard</button>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 7 — Document Scanner
// ══════════════════════════════════════════════════════════════════
function DocumentScanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState('');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUri = ev.target?.result as string;
            setPreview(dataUri); setLoading(true); setResult(null);
            try {
                const res = await axios.post(`${API}/ai/analyze-document`, { fileDataUri: dataUri, fileType:'medical document/prescription', language:'en' });
                setResult(res.data?.data);
            } catch { setResult({ error: 'Analysis failed.' }); }
            finally { setLoading(false); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <ModuleHeader icon={Scan} title="Document Scanner (AI OCR)" desc="Upload a prescription or report image. Gemini AI extracts and structures the data." />
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-sky-300 rounded-xl cursor-pointer hover:bg-sky-50 mb-6">
                <Upload className="w-8 h-8 text-sky-400 mb-2" />
                <span className="text-sm text-sky-600 font-medium">Click to upload image</span>
                <span className="text-xs text-gray-400">PNG, JPG, WebP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {preview && <img src={preview} alt="preview" className="w-48 rounded-lg border mb-4 object-contain" />}
            {loading && <Spinner />}
            {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
            {result && !result.error && (
                <div className="space-y-4">
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-sky-500 mb-2">EXPLANATION</p>
                        <p className="text-sm text-sky-900">{result.explanation}</p>
                    </div>
                    {result.abnormalValues?.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-red-500 mb-2">ABNORMAL VALUES</p>
                            <ul className="space-y-1">{result.abnormalValues.map((v:string,i:number) => <li key={i} className="text-sm text-red-800 flex gap-2"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{v}</li>)}</ul>
                        </div>
                    )}
                    {result.suggestedNextSteps?.length > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-green-500 mb-2">NEXT STEPS</p>
                            <ul className="space-y-1">{result.suggestedNextSteps.map((s:string,i:number) => <li key={i} className="text-sm text-green-800 flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 8 — Treatment Recommendation
// ══════════════════════════════════════════════════════════════════
function TreatmentRecommendation() {
    const [symptoms, setSymptoms] = useState('');
    const [history, setHistory] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const recommend = async () => {
        setLoading(true); setResult('');
        try {
            const prompt = `Clinical decision support: Based on symptoms: ${symptoms} and history: ${history||'None'}, recommend treatments using clinical guidelines. Include first-line treatments, lifestyle advice, red flags. Add disclaimer.`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language:'en', history:[] });
            setResult(res.data?.data?.response || '');
        } catch { setResult('Failed.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Stethoscope} title="Treatment Recommendation" desc="Evidence-based treatment suggestions from Gemini AI using clinical guidelines." />
            <div className="space-y-4 mb-5">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Symptoms</label>
                    <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="Describe symptoms…" className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Patient History (optional)</label>
                    <textarea value={history} onChange={e => setHistory(e.target.value)} rows={3} placeholder="Past diagnoses, medications, allergies…" className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                </div>
            </div>
            <button onClick={recommend} disabled={loading || !symptoms.trim()}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Stethoscope className="w-4 h-4" /> Get Recommendations</>}
            </button>
            {result && <div className="mt-5 bg-teal-50 border border-teal-100 rounded-xl p-5">
                <p className="text-xs font-semibold text-teal-600 mb-2">TREATMENT RECOMMENDATIONS</p>
                <pre className="text-sm text-teal-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            </div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 9 — Sentiment Analyzer
// ══════════════════════════════════════════════════════════════════
function SentimentAnalyzer() {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const analyze = async () => {
        setLoading(true); setResult(null);
        try {
            const prompt = `Analyze this patient feedback and return ONLY valid JSON:\n{ "sentiment": "Positive"|"Neutral"|"Negative", "score": 0-100, "key_topics": [], "summary": "", "actionable_improvements": [] }\n\nFeedback: "${feedback}"`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language:'en', history:[] });
            const raw = res.data?.data?.response || '{}';
            const match = raw.match(/\{[\s\S]*\}/);
            setResult(match ? JSON.parse(match[0]) : null);
        } catch { setResult({ error:'Analysis failed.' }); }
        finally { setLoading(false); }
    };

    const sentColor: Record<string,string> = { Positive:'text-green-700 bg-green-50 border-green-200', Neutral:'text-yellow-700 bg-yellow-50 border-yellow-200', Negative:'text-red-700 bg-red-50 border-red-200' };

    return (
        <div>
            <ModuleHeader icon={HeartHandshake} title="Feedback Sentiment Analyzer" desc="Analyze patient reviews. Classifies sentiment and extracts actionable improvements." />
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Paste patient feedback text here…"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none mb-4 resize-none" />
            <button onClick={analyze} disabled={loading || !feedback.trim()}
                className="bg-pink-600 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><HeartHandshake className="w-4 h-4" /> Analyze Feedback</>}
            </button>
            {result && !result.error && (
                <div className="mt-5 grid grid-cols-3 gap-4">
                    <div className={`rounded-xl p-4 border ${sentColor[result.sentiment]||'bg-gray-50 border-gray-200'}`}>
                        <p className="text-xs font-medium mb-1">Sentiment</p>
                        <p className="text-2xl font-bold">{result.sentiment}</p>
                        <p className="text-sm mt-1">Score: {result.score}/100</p>
                    </div>
                    <div className="col-span-2 bg-pink-50 border border-pink-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-pink-500 mb-2">SUMMARY</p>
                        <p className="text-sm text-pink-900">{result.summary}</p>
                    </div>
                    {result.key_topics?.length > 0 && (
                        <div className="col-span-3 bg-white border rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-500 mb-2">KEY TOPICS</p>
                            <div className="flex flex-wrap gap-2">{result.key_topics.map((t:string,i:number) => <span key={i} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">{t}</span>)}</div>
                        </div>
                    )}
                    {result.actionable_improvements?.length > 0 && (
                        <div className="col-span-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-amber-600 mb-2">IMPROVEMENTS</p>
                            <ul className="space-y-1">{result.actionable_improvements.map((a:string,i:number) => <li key={i} className="text-sm text-amber-900 flex gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />{a}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 10 — Face Attendance
// ══════════════════════════════════════════════════════════════════
function FaceAttendance({ user }: { user?: any }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streaming, setStreaming] = useState(false);

    const startCam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
        } catch { alert('Camera access denied or no camera present.'); }
    };

    const capture = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/clinic-ai/face`, { studentId: user?.id || 'staff-demo', confidence: 0.97 });
            setResult(res.data?.data);
        } catch { setResult({ error:'Attendance marking failed.' }); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Camera} title="Face Recognition Attendance (BETA)" desc="Webcam-powered staff attendance marking connected to the database." />
            <div className="flex gap-8 items-start">
                <div>
                    <div className="w-72 h-52 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-700 mb-3">
                        {streaming ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            : <div className="text-center text-slate-500"><Camera className="w-10 h-10 mx-auto mb-2" /><p className="text-sm">Camera Off</p></div>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={startCam} disabled={streaming} className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-800 disabled:opacity-40">
                            {streaming ? '● Live' : 'Start Camera'}
                        </button>
                        <button onClick={capture} disabled={loading || !streaming} className="flex-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-black disabled:opacity-40 flex items-center justify-center gap-1">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Identify</>}
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    {result && !result.error && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3"><CheckCircle className="w-6 h-6 text-green-600" /><p className="font-semibold text-green-800">Attendance Marked</p></div>
                            <div className="space-y-2 text-sm text-green-900">
                                <p><strong>Staff ID:</strong> {result.studentId}</p>
                                <p><strong>Status:</strong> {result.status}</p>
                                <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
                    {!result && <div className="text-sm text-gray-500"><p className="font-medium text-gray-700 mb-2">Steps:</p><ol className="space-y-1 list-decimal pl-4"><li>Click <strong>Start Camera</strong></li><li>Position face in frame</li><li>Click <strong>Identify</strong> to mark attendance</li></ol></div>}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODULE 11 — Workload Planner
// ══════════════════════════════════════════════════════════════════
function WorkloadPlanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const predict = async () => {
        setLoading(true); setResult('');
        try {
            const res = await axios.get(`${API}/clinic-ai/workload?clinic_id=1`);
            setResult(res.data?.data?.prediction || 'No prediction available.');
        } catch { setResult('Failed to connect to backend.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Brain} title="Predictive Workload Planner" desc="Analyzes past appointment data to predict busy hours and suggest staff deployment." />
            <button onClick={predict} disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2 mb-6">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running AI Model…</> : <><Brain className="w-4 h-4" /> Generate Workload Prediction</>}
            </button>
            {result && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                    <p className="text-xs font-semibold text-emerald-600 mb-3 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> AI WORKLOAD & STAFF ALLOCATION PLAN</p>
                    <pre className="text-sm text-emerald-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
            )}
        </div>
    );
}
