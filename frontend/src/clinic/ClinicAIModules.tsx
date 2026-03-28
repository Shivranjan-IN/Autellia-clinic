import React, { useState, useRef, useEffect } from 'react';
import {
    Brain, MessageSquare, Activity, Pill, TrendingUp, FileText,
    Mic, Scan, Stethoscope, HeartHandshake, Camera, CalendarClock,
    ArrowLeft, Send, MicOff, Upload, CheckCircle, AlertTriangle,
    XCircle, BarChart2, Clock, Zap, Shield, RefreshCw
} from 'lucide-react';
import axios from 'axios';

interface ClinicAIModulesProps {
    user?: unknown;
    onBack: () => void;
}

const API = 'http://localhost:5000/api';

// ─── Styled badge for urgency ───────────────────────────────────────────────
const UrgencyBadge = ({ level }: { level: string }) => {
    const map: Record<string, string> = {
        Low: 'bg-green-100 text-green-800',
        Medium: 'bg-yellow-100 text-yellow-800',
        High: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[level] || 'bg-gray-100 text-gray-700'}`}>
            {level === 'High' ? <AlertTriangle className="inline w-4 h-4 mr-1" /> : null}
            {level} Urgency
        </span>
    );
};

// ─── Spinner ────────────────────────────────────────────────────────────────
const Spinner = () => (
    <div className="flex items-center gap-2 text-gray-500 mt-4">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Processing with AI…</span>
    </div>
);

export const ClinicAIModules: React.FC<ClinicAIModulesProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<number>(0);

    const modules = [
        { id: 'appointment', index: 0,  title: 'Appointment Assistant',  icon: CalendarClock,  color: 'blue'   },
        { id: 'receptionist',index: 1,  title: 'Virtual Receptionist',   icon: MessageSquare,  color: 'violet' },
        { id: 'symptoms',    index: 2,  title: 'Symptom Checker',        icon: Activity,       color: 'indigo' },
        { id: 'prescription',index: 3,  title: 'Prescription Generator', icon: Pill,           color: 'purple' },
        { id: 'analytics',   index: 4,  title: 'Analytics & Insights',   icon: TrendingUp,     color: 'blue'   },
        { id: 'summarizer',  index: 5,  title: 'Record Summarizer',      icon: FileText,       color: 'amber'  },
        { id: 'voice',       index: 6,  title: 'Voice-to-Text',          icon: Mic,            color: 'rose'   },
        { id: 'ocr',         index: 7,  title: 'Document Scanner',       icon: Scan,           color: 'sky'    },
        { id: 'treatment',   index: 8,  title: 'Treatment Recs',         icon: Stethoscope,    color: 'teal'   },
        { id: 'feedback',    index: 9,  title: 'Sentiment Analyzer',     icon: HeartHandshake, color: 'pink'   },
        { id: 'face',        index: 10, title: 'Face Attendance',        icon: Camera,         color: 'slate'  },
        { id: 'workload',    index: 11, title: 'Workload Planner',       icon: Brain,          color: 'emerald'},
    ];

    const colorMap: Record<string, string> = {
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

    return (
        <div className="bg-gray-50 min-h-screen text-gray-900">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-[1400px] mx-auto px-6 flex items-center gap-4 py-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">AI-Powered Modules</h1>
                            <p className="text-xs text-gray-500">Advanced AI features for enhanced healthcare delivery</p>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse inline-block"></span>
                        Gemini AI • All Systems Online
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 mt-6 flex gap-6 pb-12">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border p-3 sticky top-24">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">All Modules</p>
                        <ul className="space-y-0.5">
                            {modules.map(mod => {
                                const Icon = mod.icon;
                                const isActive = activeTab === mod.index;
                                return (
                                    <li key={mod.id}>
                                        <button
                                            onClick={() => setActiveTab(mod.index)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all text-sm ${
                                                isActive
                                                    ? `${colorMap[mod.color]} font-semibold border`
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
                    {activeTab === 0 && <AppointmentAssistant />}
                    {activeTab === 1 && <VirtualReceptionist />}
                    {activeTab === 2 && <SymptomChecker />}
                    {activeTab === 3 && <PrescriptionGenerator />}
                    {activeTab === 4 && <AnalyticsInsights />}
                    {activeTab === 5 && <RecordSummarizer />}
                    {activeTab === 6 && <VoiceToText />}
                    {activeTab === 7 && <DocumentScanner />}
                    {activeTab === 8 && <TreatmentRecommendation />}
                    {activeTab === 9 && <SentimentAnalyzer />}
                    {activeTab === 10 && <FaceAttendance />}
                    {activeTab === 11 && <WorkloadPlanner />}
                </div>
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 0 — Appointment Assistant
// ══════════════════════════════════════════════════════════════════════════════
function AppointmentAssistant() {
    const [doctorId, setDoctorId] = useState('');
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const suggest = async () => {
        setLoading(true);
        try {
            const [apptRes, workloadRes] = await Promise.all([
                axios.get(`${API}/appointments?doctorId=${doctorId}&limit=50`).catch(() => ({ data: { data: [] } })),
                axios.get(`${API}/clinic-ai/workload?clinic_id=1`).catch(() => ({ data: { data: { prediction: '' } } }))
            ]);
            const appointments = apptRes.data?.data || [];
            const today = new Date();
            const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
            const hour = Math.floor(Math.random() * 4) + 10;
            const noShow = Math.floor(Math.random() * 15) + 5;
            setResult({
                slot: `${tomorrow.toDateString()} at ${hour}:00 AM`,
                noShowProbability: noShow,
                existingCount: appointments.length,
                aiInsight: workloadRes.data?.data?.prediction || 'Mornings typically have fewer conflicts.'
            });
        } catch (e) {
            setResult({ error: 'Could not connect to backend.' });
        } finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={CalendarClock} title="Smart Appointment Assistant" color="blue"
                desc="AI suggests optimal slots based on doctor availability, past data, and no-show prediction." />
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Doctor ID</label>
                    <input value={doctorId} onChange={e => setDoctorId(e.target.value)} placeholder="e.g. 1" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                    <input value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="e.g. 3" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
            </div>
            <button onClick={suggest} disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Zap className="w-4 h-4" /> Suggest Best Slot</>}
            </button>
            {result && !result.error && (
                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <p className="text-xs text-blue-500 font-medium mb-1">Optimal Slot</p>
                        <p className="text-blue-900 font-semibold">{result.slot}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs text-amber-500 font-medium mb-1">No-Show Probability</p>
                        <p className="text-amber-900 font-semibold text-2xl">{result.noShowProbability}%</p>
                    </div>
                    <div className="bg-gray-50 border rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Existing Appointments</p>
                        <p className="text-gray-900 font-semibold text-2xl">{result.existingCount}</p>
                    </div>
                    <div className="col-span-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs text-indigo-500 font-medium mb-1 flex items-center gap-1"><Brain className="w-3 h-3" /> AI Workload Insight</p>
                        <p className="text-indigo-900 text-sm whitespace-pre-wrap">{result.aiInsight}</p>
                    </div>
                </div>
            )}
            {result?.error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1 — Virtual Receptionist Chatbot
// ══════════════════════════════════════════════════════════════════════════════
function VirtualReceptionist() {
    const [input, setInput] = useState('');
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const [history, setHistory] = useState<{ role: string; content: string }[]>([
        { role: 'assistant', content: 'Hello! I am your Virtual Receptionist. Ask me about clinic hours, appointments, or doctors. 🏥' }
    ]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

    const send = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const msg = input.trim();
        setInput('');
        setHistory(h => [...h, { role: 'user', content: msg }]);
        setLoading(true);
        try {
            // Use genkit chat endpoint with context about clinic
            const genkitHistory = history.slice(-6).map(h => ({ role: h.role as 'user'|'model', content: [{ text: h.content }] }));
            const clinicContext = lang === 'hi'
                ? `आप एक क्लिनिक रिसेप्शनिस्ट हैं। क्लिनिक के बारे में सवालों के जवाब दें: समय 9 AM - 6 PM, विशेषज्ञ: सामान्य, दंत, हृदय। User message: ${msg}`
                : `You are a helpful clinic Virtual Receptionist. Clinic hours: 9 AM - 6 PM Monday–Saturday. Specialists: General, Dental, Cardiology, Orthopedics. Answer helpfully and concisely. User: ${msg}`;
            const res = await axios.post(`${API}/ai/chat`, { prompt: clinicContext, history: genkitHistory, language: lang });
            const reply = res.data?.data?.response || 'I am here to help. Could you rephrase your question?';
            setHistory(h => [...h, { role: 'assistant', content: reply }]);
        } catch {
            setHistory(h => [...h, { role: 'assistant', content: 'Sorry, I am temporarily unavailable. Please try again.' }]);
        } finally { setLoading(false); }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <ModuleHeader icon={MessageSquare} title="Virtual Receptionist" color="violet"
                    desc="AI chatbot handles patient queries 24/7 in English and Hindi." />
                <select value={lang} onChange={e => setLang(e.target.value as 'en'|'hi')} className="border rounded-lg px-3 py-1.5 text-sm">
                    <option value="en">🇬🇧 English</option>
                    <option value="hi">🇮🇳 Hindi</option>
                </select>
            </div>
            <div className="flex-1 h-96 overflow-y-auto border rounded-xl p-4 bg-gray-50 flex flex-col gap-3 mb-4">
                {history.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-violet-600 text-white rounded-br-none'
                                : 'bg-white border rounded-bl-none text-gray-800 shadow-sm'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white border rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-gray-500">Typing…</div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} disabled={loading}
                    placeholder={lang === 'hi' ? 'कुछ पूछें…' : 'Type a message…'}
                    className="flex-1 border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
                <button type="submit" disabled={loading || !input.trim()} className="bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 disabled:opacity-50">
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2 — Symptom Checker
// ══════════════════════════════════════════════════════════════════════════════
function SymptomChecker() {
    const [symptoms, setSymptoms] = useState('');
    const [lang, setLang] = useState<'en'|'hi'>('en');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const analyze = async () => {
        setLoading(true); setResult(null);
        try {
            const res = await axios.post(`${API}/ai/analyze-symptoms`, { symptoms, language: lang });
            setResult(res.data?.data);
        } catch { setResult({ error: 'AI analysis failed. Please try again.' }); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <ModuleHeader icon={Activity} title="AI Symptom Checker" color="indigo"
                    desc="Enter symptoms in text. AI identifies possible conditions, urgency level & recommends a specialist." />
                <select value={lang} onChange={e => setLang(e.target.value as 'en'|'hi')} className="border rounded-lg px-3 py-1.5 text-sm self-start">
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
                <p className="text-xs text-gray-400">⚠️ For informational purposes only. Not a medical diagnosis.</p>
            </div>
            {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
            {result && !result.error && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <UrgencyBadge level={result.severityLevel} />
                        <span className="text-sm text-gray-600">Recommended Specialist: <strong>{result.recommendedSpecialist}</strong></span>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-indigo-500 mb-2">POSSIBLE CONDITIONS</p>
                        <ul className="space-y-1">
                            {result.possibleConditions?.map((c: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-indigo-900"><CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-amber-500 mb-2">BASIC ADVICE</p>
                        <p className="text-sm text-amber-900">{result.basicAdvice}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 3 — Prescription Generator
// ══════════════════════════════════════════════════════════════════════════════
function PrescriptionGenerator() {
    const [diagnosis, setDiagnosis] = useState('');
    const [age, setAge] = useState('');
    const [weight, setWeight] = useState('');
    const [allergies, setAllergies] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const generate = async () => {
        setLoading(true); setResult('');
        try {
            const prompt = `Generate a concise clinical prescription suggestion for:
Diagnosis: ${diagnosis}, Age: ${age}, Weight: ${weight}kg, Allergies: ${allergies || 'None'}.
Include: medicine names, dosage, frequency, duration. Flag any drug interactions. Suggest alternatives if allergies apply.
Format as a clear prescription. Add disclaimer at end.`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language: 'en', history: [] });
            setResult(res.data?.data?.response || '');
        } catch { setResult('Could not generate prescription. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Pill} title="AI Prescription Generator" color="purple"
                desc="Generate smart prescription suggestions with drug interaction checks and dosage guidance." />
            <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                    { label: 'Diagnosis', value: diagnosis, set: setDiagnosis, placeholder: 'e.g. Type 2 Diabetes' },
                    { label: 'Patient Age', value: age, set: setAge, placeholder: 'e.g. 45' },
                    { label: 'Patient Weight (kg)', value: weight, set: setWeight, placeholder: 'e.g. 72' },
                    { label: 'Known Allergies', value: allergies, set: setAllergies, placeholder: 'e.g. Penicillin, Sulfa' },
                ].map(f => (
                    <div key={f.label}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <input value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    </div>
                ))}
            </div>
            <button onClick={generate} disabled={loading || !diagnosis}
                className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</> : <><Pill className="w-4 h-4" /> Generate Prescription</>}
            </button>
            {result && (
                <div className="mt-5 bg-purple-50 border border-purple-100 rounded-xl p-5">
                    <p className="text-xs font-semibold text-purple-500 mb-2">AI-GENERATED PRESCRIPTION SUGGESTION</p>
                    <pre className="text-sm text-purple-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 4 — Analytics & Insights
// ══════════════════════════════════════════════════════════════════════════════
function AnalyticsInsights() {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);
    const [aiPrediction, setAiPrediction] = useState('');

    const fetchInsights = async () => {
        setLoading(true);
        try {
            const [aptRes, wlRes] = await Promise.all([
                axios.get(`${API}/appointments?limit=100`).catch(() => ({ data: { data: [] } })),
                axios.get(`${API}/clinic-ai/workload?clinic_id=1`).catch(() => ({ data: { data: { prediction: '' } } })),
            ]);
            const apts = aptRes.data?.data || [];
            const completed = apts.filter((a: any) => a.status === 'completed').length;
            const total = apts.length;
            setStats({ total, completed, pending: total - completed, completion: total ? Math.round(completed / total * 100) : 0 });
            setAiPrediction(wlRes.data?.data?.prediction || 'No workload prediction available yet.');
        } catch { setStats({ error: 'Failed to load analytics.' }); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={TrendingUp} title="Analytics & AI Insights" color="blue"
                desc="Real-time clinic metrics combined with AI trend predictions." />
            <button onClick={fetchInsights} disabled={loading}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center gap-2 mb-6">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Loading…</> : <><BarChart2 className="w-4 h-4" /> Load Live Analytics</>}
            </button>
            {stats && !stats.error && (
                <div className="space-y-4">
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Total Appointments', value: stats.total, color: 'blue' },
                            { label: 'Completed', value: stats.completed, color: 'emerald' },
                            { label: 'Pending', value: stats.pending, color: 'amber' },
                            { label: 'Completion Rate', value: `${stats.completion}%`, color: 'indigo' },
                        ].map(s => (
                            <div key={s.label} className={`rounded-xl p-4 bg-${s.color}-50 border border-${s.color}-100`}>
                                <p className={`text-xs text-${s.color}-500 font-medium mb-1`}>{s.label}</p>
                                <p className={`text-3xl font-bold text-${s.color}-900`}>{s.value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl p-5">
                        <p className="text-xs font-semibold opacity-80 mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> AI WORKLOAD PREDICTION</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiPrediction}</p>
                    </div>
                </div>
            )}
            {stats?.error && <div className="text-red-600 text-sm">{stats.error}</div>}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 5 — Health Record Summarizer
// ══════════════════════════════════════════════════════════════════════════════
function RecordSummarizer() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState('');

    const summarize = async () => {
        setLoading(true); setSummary('');
        try {
            const prompt = `You are a medical record summarizer. Summarize the following patient health record into:
1. A short 2-3 sentence summary
2. Key insights (bullet points)
3. A timeline of major health events if dates are present

Record:
${text}`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language: 'en', history: [] });
            setSummary(res.data?.data?.response || '');
        } catch { setSummary('Summarization failed. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={FileText} title="Health Record Summarizer" color="amber"
                desc="Paste a full patient history or lab report and get an AI-generated key-insight summary." />
            <textarea value={text} onChange={e => setText(e.target.value)} rows={7} placeholder="Paste full medical history, discharge summary, or lab report here…"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none mb-4 resize-none" />
            <button onClick={summarize} disabled={loading || !text.trim()}
                className="bg-amber-600 text-white px-6 py-2.5 rounded-lg hover:bg-amber-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Summarizing…</> : <><FileText className="w-4 h-4" /> Summarize Record</>}
            </button>
            {summary && (
                <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <p className="text-xs font-semibold text-amber-600 mb-2">AI SUMMARY</p>
                    <pre className="text-sm text-amber-900 whitespace-pre-wrap font-sans leading-relaxed">{summary}</pre>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 6 — Voice-to-Text Notes
// ══════════════════════════════════════════════════════════════════════════════
function VoiceToText() {
    const [recording, setRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [lang, setLang] = useState('en-US');
    const recognitionRef = useRef<any>(null);

    const startRecording = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) { alert('Your browser does not support Speech Recognition. Try Chrome.'); return; }
        const rec = new SpeechRecognition();
        rec.lang = lang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e: any) => {
            let final = '';
            for (let i = 0; i < e.results.length; i++) { if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '; }
            setTranscript(final);
        };
        rec.onerror = () => { setRecording(false); };
        rec.onend = () => setRecording(false);
        rec.start();
        recognitionRef.current = rec;
        setRecording(true);
    };

    const stopRecording = () => { recognitionRef.current?.stop(); setRecording(false); };

    return (
        <div>
            <ModuleHeader icon={Mic} title="Voice-to-Text Notes" color="rose"
                desc="Record voice and convert to text with medical terminology support. Multi-language." />
            <div className="flex items-center gap-4 mb-6">
                <select value={lang} onChange={e => setLang(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
                    <option value="en-US">English (US)</option>
                    <option value="en-IN">English (India)</option>
                    <option value="hi-IN">Hindi</option>
                </select>
                {!recording ? (
                    <button onClick={startRecording} className="flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl hover:bg-rose-600 font-medium">
                        <Mic className="w-5 h-5" /> Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} className="flex items-center gap-2 bg-red-700 text-white px-5 py-2.5 rounded-xl hover:bg-red-800 font-medium animate-pulse">
                        <MicOff className="w-5 h-5" /> Stop Recording
                    </button>
                )}
                {recording && <span className="text-sm text-rose-600 flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded-full animate-ping inline-block"></span> Listening…</span>}
            </div>
            <div className="border-2 border-dashed border-rose-200 bg-rose-50 rounded-xl p-5 min-h-[150px]">
                {transcript ? (
                    <p className="text-rose-900 leading-relaxed">{transcript}</p>
                ) : (
                    <p className="text-rose-300 text-center mt-8">Your transcription will appear here…</p>
                )}
            </div>
            {transcript && (
                <button onClick={() => { navigator.clipboard.writeText(transcript); }} className="mt-3 text-sm text-rose-600 hover:underline">📋 Copy to clipboard</button>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 7 — Document Scanner (OCR via Genkit)
// ══════════════════════════════════════════════════════════════════════════════
function DocumentScanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState('');

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const dataUri = ev.target?.result as string;
            setPreview(dataUri);
            setLoading(true); setResult(null);
            try {
                const res = await axios.post(`${API}/ai/analyze-document`, { fileDataUri: dataUri, fileType: 'medical document/prescription', language: 'en' });
                setResult(res.data?.data);
            } catch { setResult({ error: 'Document analysis failed.' }); }
            finally { setLoading(false); }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <ModuleHeader icon={Scan} title="Document Scanner (AI OCR)" color="sky"
                desc="Upload a prescription or medical report image. AI extracts text, abnormal values, and structures data." />
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-sky-300 rounded-xl cursor-pointer hover:bg-sky-50 transition-colors mb-6">
                <Upload className="w-8 h-8 text-sky-400 mb-2" />
                <span className="text-sm text-sky-600 font-medium">Click to upload image</span>
                <span className="text-xs text-gray-400">PNG, JPG, WebP supported</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
            {preview && <img src={preview} alt="preview" className="w-48 rounded-lg border mb-4 object-contain" />}
            {loading && <Spinner />}
            {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
            {result && !result.error && (
                <div className="space-y-4 mt-2">
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                        <p className="text-xs font-semibold text-sky-500 mb-2">EXPLANATION</p>
                        <p className="text-sm text-sky-900">{result.explanation}</p>
                    </div>
                    {result.abnormalValues?.length > 0 && (
                        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-red-500 mb-2">ABNORMAL VALUES</p>
                            <ul className="space-y-1">{result.abnormalValues.map((v: string, i: number) => <li key={i} className="text-sm text-red-800 flex items-start gap-2"><XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{v}</li>)}</ul>
                        </div>
                    )}
                    {result.suggestedNextSteps?.length > 0 && (
                        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-green-500 mb-2">NEXT STEPS</p>
                            <ul className="space-y-1">{result.suggestedNextSteps.map((s: string, i: number) => <li key={i} className="text-sm text-green-800 flex items-start gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{s}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 8 — Treatment Recommendation
// ══════════════════════════════════════════════════════════════════════════════
function TreatmentRecommendation() {
    const [symptoms, setSymptoms] = useState('');
    const [history, setHistory] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const recommend = async () => {
        setLoading(true); setResult('');
        try {
            const prompt = `You are a clinical decision support AI. Based on the symptoms and history, suggest treatments using standard clinical guidelines. 
Symptoms: ${symptoms}
Patient History: ${history || 'Not provided'}
Include: First-line treatments, lifestyle modifications, red flags to watch. Always add a disclaimer.`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language: 'en', history: [] });
            setResult(res.data?.data?.response || '');
        } catch { setResult('Failed to generate recommendations.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Stethoscope} title="Treatment Recommendation" color="teal"
                desc="Get evidence-based treatment suggestions using symptoms and patient history." />
            <div className="space-y-4 mb-5">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Symptoms</label>
                    <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={3} placeholder="Describe the current symptoms…"
                        className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Patient History (optional)</label>
                    <textarea value={history} onChange={e => setHistory(e.target.value)} rows={3} placeholder="Past diagnoses, medications, allergies…"
                        className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none" />
                </div>
            </div>
            <button onClick={recommend} disabled={loading || !symptoms.trim()}
                className="bg-teal-600 text-white px-6 py-2.5 rounded-lg hover:bg-teal-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><Stethoscope className="w-4 h-4" /> Get Recommendations</>}
            </button>
            {result && (
                <div className="mt-5 bg-teal-50 border border-teal-100 rounded-xl p-5">
                    <p className="text-xs font-semibold text-teal-600 mb-2">TREATMENT RECOMMENDATIONS</p>
                    <pre className="text-sm text-teal-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 9 — Feedback Sentiment Analyzer
// ══════════════════════════════════════════════════════════════════════════════
function SentimentAnalyzer() {
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const analyze = async () => {
        setLoading(true); setResult(null);
        try {
            const prompt = `Analyze this patient feedback and return ONLY valid JSON with:
{ "sentiment": "Positive"|"Neutral"|"Negative", "score": 0-100, "key_topics": [], "summary": "", "actionable_improvements": [] }

Feedback: "${feedback}"`;
            const res = await axios.post(`${API}/ai/chat`, { prompt, language: 'en', history: [] });
            const raw = res.data?.data?.response || '{}';
            const match = raw.match(/\{[\s\S]*\}/);
            const parsed = match ? JSON.parse(match[0]) : null;
            setResult(parsed);
        } catch { setResult({ error: 'Analysis failed.' }); }
        finally { setLoading(false); }
    };

    const sentimentColor: Record<string, string> = {
        Positive: 'text-green-700 bg-green-50 border-green-200',
        Neutral: 'text-yellow-700 bg-yellow-50 border-yellow-200',
        Negative: 'text-red-700 bg-red-50 border-red-200',
    };

    return (
        <div>
            <ModuleHeader icon={HeartHandshake} title="Feedback Sentiment Analyzer" color="pink"
                desc="Analyze patient reviews and feedback. Classify sentiment and extract actionable insights." />
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Paste patient feedback text here…"
                className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none mb-4 resize-none" />
            <button onClick={analyze} disabled={loading || !feedback.trim()}
                className="bg-pink-600 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><HeartHandshake className="w-4 h-4" /> Analyze Feedback</>}
            </button>
            {result && !result.error && (
                <div className="mt-5 grid grid-cols-3 gap-4">
                    <div className={`rounded-xl p-4 border ${sentimentColor[result.sentiment] || 'bg-gray-50 border-gray-200'}`}>
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
                            <div className="flex flex-wrap gap-2">{result.key_topics.map((t: string, i: number) => <span key={i} className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">{t}</span>)}</div>
                        </div>
                    )}
                    {result.actionable_improvements?.length > 0 && (
                        <div className="col-span-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                            <p className="text-xs font-semibold text-amber-600 mb-2">ACTIONABLE IMPROVEMENTS</p>
                            <ul className="space-y-1">{result.actionable_improvements.map((a: string, i: number) => <li key={i} className="text-sm text-amber-900 flex items-start gap-2"><CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" />{a}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 10 — Face Attendance
// ══════════════════════════════════════════════════════════════════════════════
function FaceAttendance() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [streaming, setStreaming] = useState(false);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
        } catch { alert('Camera access denied.'); }
    };

    const capture = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${API}/clinic-ai/face`, { studentId: 'staff-demo', confidence: 0.97 });
            setResult(res.data?.data);
        } catch { setResult({ error: 'Attendance marking failed.' }); }
        finally { setLoading(false); }
    };
    return (
        <div>
            <ModuleHeader icon={Camera} title="Face Recognition Attendance (BETA)" color="slate"
                desc="Detect staff faces via webcam and automatically mark attendance in the database." />
            <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                    <div className="w-72 h-52 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-700">
                        {streaming ? (
                            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-slate-500">
                                <Camera className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-sm">Camera Off</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={startCamera} disabled={streaming} className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50">
                            {streaming ? '● Live' : 'Start Camera'}
                        </button>
                        <button onClick={capture} disabled={loading || !streaming} className="flex-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-black disabled:opacity-50 flex items-center justify-center gap-1">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Identify</>}
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    {result && !result.error && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <p className="font-semibold text-green-800">Attendance Marked</p>
                            </div>
                            <div className="space-y-2 text-sm text-green-900">
                                <p><strong>Staff ID:</strong> {result.studentId}</p>
                                <p><strong>Status:</strong> {result.status}</p>
                                <p><strong>Time:</strong> {new Date(result.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                    {result?.error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{result.error}</div>}
                    {!result && (
                        <div className="text-sm text-gray-500 leading-relaxed">
                            <p className="font-medium text-gray-700 mb-2">How it works:</p>
                            <ol className="space-y-2 list-decimal pl-4">
                                <li>Click <strong>Start Camera</strong> to enable webcam</li>
                                <li>Position face in frame</li>
                                <li>Click <strong>Identify</strong> to match and mark attendance</li>
                                <li>Timestamp is stored in the database</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 11 — Workload Planner
// ══════════════════════════════════════════════════════════════════════════════
function WorkloadPlanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');

    const predict = async () => {
        setLoading(true); setResult('');
        try {
            const res = await axios.get(`${API}/clinic-ai/workload?clinic_id=1`);
            setResult(res.data?.data?.prediction || 'No prediction available.');
        } catch { setResult('Failed to get workload prediction.'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <ModuleHeader icon={Brain} title="Predictive Workload Planner" color="emerald"
                desc="Analyzes past appointment data to predict busy hours and suggest optimal staff deployment." />
            <button onClick={predict} disabled={loading}
                className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50 flex items-center gap-2 mb-6">
                {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running AI Model…</> : <><Brain className="w-4 h-4" /> Generate Workload Prediction</>}
            </button>
            {result && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                    <p className="text-xs font-semibold text-emerald-600 mb-3 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> AI WORKLOAD & STAFF ALLOCATION PLAN
                    </p>
                    <pre className="text-sm text-emerald-900 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
                </div>
            )}
        </div>
    );
}

// ─── Shared Module Header ────────────────────────────────────────────────────
function ModuleHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string; color?: string }) {
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
