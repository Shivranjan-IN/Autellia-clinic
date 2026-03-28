import React, { useState, useRef, useEffect } from 'react';
import {
    Brain,
    Mic,
    FileText,
    Volume2,
    Scan,
    TrendingUp,
    Sparkles,
    Send,
    Upload,
    Play,
    Pause,
    AlertCircle,
    Activity,
    Stethoscope,
    FileImage
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Textarea } from '../common/ui/textarea';
import { Badge } from '../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { useNavigation } from '../contexts/NavigationContext';
import { toast } from 'react-hot-toast';

// Web Speech API Types
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export function AIHealthTools() {
    const { navigateTo } = useNavigation();
    
    // Core State
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [activeTab, setActiveTab] = useState('symptoms');
    
    // Symptoms & Voice
    const [symptomText, setSymptomText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Document Analyzer
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // AI Analysis Output
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let currentTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        setSymptomText((prev) => prev + transcript + ' ');
                    } else {
                        currentTranscript += transcript;
                    }
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };
        }
        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            toast.error("Speech Recognition is not supported in this browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-US';
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error(err);
                setIsRecording(false);
            }
        }
    };

    // File Handling
    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelection = (selectedFile: File) => {
        // Limit to 20MB
        if (selectedFile.size > 20 * 1024 * 1024) {
            toast.error("File size exceeds 20MB limit.");
            return;
        }
        setFile(selectedFile);
        
        // Setup preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    };

    // APIs
    const handleAnalyzeSymptoms = async () => {
        if (!symptomText.trim()) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const response = await fetch('http://localhost:5000/api/ai/analyze-symptoms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symptoms: symptomText, language: selectedLanguage })
            });
            const data = await response.json();
            if (data.success) {
                setAnalysisResult({ type: 'symptoms', data: data.data });
            } else {
                toast.error(data.message || 'Analysis failed');
            }
        } catch (err) {
            toast.error("Failed to connect to AI engine");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAnalyzeDocument = async () => {
        if (!filePreview) return;
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const response = await fetch('http://localhost:5000/api/ai/analyze-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    fileDataUri: filePreview, 
                    fileType: file?.type,
                    language: selectedLanguage 
                })
            });
            const data = await response.json();
            if (data.success) {
                setAnalysisResult({ type: 'document', data: data.data });
            } else {
                toast.error(data.message || 'Document analysis failed');
            }
        } catch (err) {
            toast.error("Failed to connect to AI engine");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleTTS = async (textToSpeak: string) => {
        setIsPlaying(true);
        try {
            const response = await fetch('http://localhost:5000/api/ai/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak, language: selectedLanguage }),
            });
            const data = await response.json();
            if (data.success && data.data?.audioDataUri) {
                const audio = new Audio(data.data.audioDataUri);
                audio.onended = () => setIsPlaying(false);
                audio.play();
            } else {
                toast.error("Failed to generate audio summary");
                setIsPlaying(false);
            }
        } catch (error) {
            console.error('TTS failed:', error);
            setIsPlaying(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-blue-600" />
                        AI Medical Intelligence
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Your intelligent symptom and record analysis engine.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-[180px] bg-gray-50 border-0 focus:ring-0">
                            <SelectValue placeholder="Language" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ── INTERACTIVE WORKSPACE ── */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-0 shadow-lg bg-white overflow-hidden rounded-3xl">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-white/50 p-1 rounded-xl">
                                    <TabsTrigger value="symptoms" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                        <Activity className="w-4 h-4 mr-2" />
                                        Symptom Checker
                                    </TabsTrigger>
                                    <TabsTrigger value="document" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                                        <Scan className="w-4 h-4 mr-2" />
                                        Document Analyzer
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        
                        <CardContent className="p-6">
                            {/* SYMPTOMS TAB */}
                            {activeTab === 'symptoms' && (
                                <div className="space-y-6 animate-in fade-in ease-out duration-300">
                                    <div className="relative">
                                        <Textarea
                                            placeholder={selectedLanguage === 'hi' ? "अपने लक्षणों का वर्णन करें... (उदा: 'मुझे 3 दिन से बुखार है और कमजोरी लग रही है')" : "Describe your symptoms... (e.g., 'I have had a fever for 3 days and feel weak')"}
                                            value={symptomText}
                                            onChange={(e) => setSymptomText(e.target.value)}
                                            rows={6}
                                            className="resize-none bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-2xl p-5 text-gray-800 text-lg placeholder:text-gray-400"
                                        />
                                        
                                        {/* Microphone Button overlay */}
                                        <div className="absolute bottom-4 right-4 flex gap-2">
                                            {isRecording && (
                                                <span className="flex items-center gap-2 text-sm text-red-500 font-medium animate-pulse px-3">
                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                    Listening...
                                                </span>
                                            )}
                                            <Button
                                                onClick={toggleRecording}
                                                size="icon"
                                                variant={isRecording ? 'destructive' : 'secondary'}
                                                className={`rounded-xl shadow-sm transition-all ${isRecording ? 'animate-bounce' : 'hover:bg-blue-100 hover:text-blue-600'}`}
                                            >
                                                {isRecording ? <Pause className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAnalyzeSymptoms}
                                        disabled={!symptomText.trim() || isAnalyzing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg"
                                    >
                                        {isAnalyzing ? (
                                            <><Sparkles className="w-5 h-5 mr-3 animate-spin" /> Analyzing Symptoms...</>
                                        ) : (
                                            <><Brain className="w-5 h-5 mr-3" /> Get Clinical Insights</>
                                        )}
                                    </Button>
                                    
                                    <div className="flex gap-2 text-xs text-gray-500 justify-center">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-normal">Hindi Support Enabled</Badge>
                                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 font-normal">Real-time Voice to Text</Badge>
                                    </div>
                                </div>
                            )}

                            {/* DOCUMENT TAB */}
                            {activeTab === 'document' && (
                                <div className="space-y-6 animate-in fade-in ease-out duration-300">
                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={() => setIsDragging(false)}
                                        onDrop={handleFileDrop}
                                        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50/50 hover:bg-gray-50'}`}
                                    >
                                        {filePreview ? (
                                            <div className="w-full relative rounded-2xl overflow-hidden shadow-inner border border-gray-100 bg-white p-2">
                                                {file?.type.startsWith('image/') ? (
                                                    <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-900 group">
                                                        <img src={filePreview} alt="Preview" className="w-full h-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Button variant="secondary" onClick={() => setFilePreview(null)} className="rounded-full">Change File</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-12 text-center bg-blue-50 rounded-xl relative group">
                                                        <FileImage className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                                                        <span className="font-semibold text-blue-900">{file?.name}</span>
                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                            <Button variant="secondary" onClick={() => setFilePreview(null)} className="rounded-full shadow-lg">Change File</Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                                    <Upload className="w-8 h-8 text-blue-500" />
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Report or X-Ray</h3>
                                                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Drag and drop your PDF lab report, tissue scan, or X-ray image here (JPG, PNG, PDF)</p>
                                                
                                                <div className="relative">
                                                    <input 
                                                        type="file" 
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileSelection(e.target.files[0]);
                                                            }
                                                        }}
                                                    />
                                                    <Button variant="outline" className="h-12 px-8 rounded-xl font-medium border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 pointer-events-none">
                                                        Browse Device Files
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        onClick={handleAnalyzeDocument}
                                        disabled={!filePreview || isAnalyzing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg"
                                    >
                                        {isAnalyzing ? (
                                            <><Sparkles className="w-5 h-5 mr-3 animate-spin" /> Extracting AI Intelligence...</>
                                        ) : (
                                            <><FileText className="w-5 h-5 mr-3" /> Perform Comprehensive Analysis</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* ── ANALYSIS OUTPUT ── */}
                <div className="lg:col-span-5 flex flex-col">
                    <Card className={`border-0 shadow-lg flex-1 flex flex-col rounded-3xl overflow-hidden transition-all duration-500 ${analysisResult ? 'bg-gradient-to-b from-blue-50 to-white' : 'bg-gray-50/50 items-center justify-center'}`}>
                        {analysisResult ? (
                            <div className="p-6 md:p-8 flex flex-col h-full animate-in slide-in-from-right-8 duration-500">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
                                            {analysisResult.type === 'symptoms' ? <Stethoscope className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-xl text-gray-900">
                                                {analysisResult.type === 'symptoms' ? 'Clinical Assessment' : 'Document Intelligence'}
                                            </h3>
                                            <p className="text-blue-600 font-medium text-sm">AI Generated Analysis</p>
                                        </div>
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => {
                                            const textToSpeak = analysisResult.type === 'symptoms' 
                                                ? analysisResult.data.basicAdvice 
                                                : analysisResult.data.summary;
                                            handleTTS(textToSpeak);
                                        }}
                                        disabled={isPlaying}
                                        className="rounded-full shadow-sm hover:bg-blue-50 hover:text-blue-600 border-gray-200 bg-white"
                                        title="Play Audio Summary"
                                    >
                                        {isPlaying ? <Activity className="w-5 h-5 animate-pulse text-blue-600" /> : <Volume2 className="w-5 h-5" />}
                                    </Button>
                                </div>

                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    {/* Symptoms Specific Output */}
                                    {analysisResult.type === 'symptoms' && (
                                        <>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Severity Focus</span>
                                                    <Badge className={`uppercase text-[10px] font-bold px-3 py-1 ${
                                                        analysisResult.data.severityLevel === 'High' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                                                        analysisResult.data.severityLevel === 'Medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                                        'bg-green-100 text-green-700 hover:bg-green-200'
                                                    }`}>
                                                        {analysisResult.data.severityLevel} Risk
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold text-gray-800 mb-2">Possible Conditions:</h4>
                                                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                                                    {analysisResult.data.possibleConditions?.map((c: string, idx: number) => <li key={idx} className="leading-relaxed text-sm">{c}</li>)}
                                                </ul>
                                            </div>

                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-purple-500" />
                                                    AI Clinical Advice
                                                </h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">{analysisResult.data.basicAdvice}</p>
                                            </div>

                                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                                                <div className="p-2 bg-blue-100 rounded-lg shrink-0 mt-1">
                                                    <Stethoscope className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Recommended Specialist</p>
                                                    <p className="font-bold text-blue-900 text-lg">{analysisResult.data.recommendedSpecialist}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Document Specific Output */}
                                    {analysisResult.type === 'document' && (
                                        <>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <h4 className="font-semibold text-gray-800 mb-2">Executive Summary</h4>
                                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{analysisResult.data.explanation}</p>
                                                
                                                <div className="p-4 bg-gray-50 rounded-xl">
                                                    <h5 className="font-medium text-gray-700 text-xs uppercase mb-2">Patient Plain Language</h5>
                                                    <p className="text-gray-600 text-sm font-medium">{analysisResult.data.summary}</p>
                                                </div>
                                            </div>

                                            {(analysisResult.data.abnormalValues?.length > 0 || analysisResult.data.riskIndicators?.length > 0) && (
                                                <div className="p-5 rounded-2xl border border-red-100 bg-red-50/30">
                                                    <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                                        <AlertCircle className="w-4 h-4" /> Attention Required
                                                    </h4>
                                                    {analysisResult.data.riskIndicators?.map((r: string, i: number) => (
                                                        <div key={i} className="bg-red-100 text-red-800 text-xs px-3 py-1.5 rounded-lg inline-flex mr-2 mb-2 font-medium">{r}</div>
                                                    ))}
                                                    <div className="mt-2 text-sm text-red-700 space-y-1">
                                                        {analysisResult.data.abnormalValues?.map((val: string, i: number) => (
                                                            <div key={i} className="flex gap-2"><span className="font-bold">•</span> {val}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {analysisResult.data.suggestedNextSteps?.length > 0 && (
                                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                    <h4 className="font-semibold text-gray-800 mb-2">Recommended Next Steps</h4>
                                                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                                                        {analysisResult.data.suggestedNextSteps.map((step: string, i: number) => <li key={i} className="text-sm leading-relaxed">{step}</li>)}
                                                    </ul>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 pt-5 border-t border-gray-200">
                                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                                            This is an AI-generated preliminary assessment and not a medical diagnosis. Always consult a qualified medical professional for diagnosis or treatment.
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between">
                                        <Button variant="ghost" className="text-gray-500 hover:text-gray-800">Save Record</Button>
                                        <Button className="bg-gray-900 text-white hover:bg-gray-800">Locate Specialist</Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-12 max-w-sm">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Brain className="w-10 h-10 text-gray-400 opacity-50" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 mb-3">Intelligence Awaiting</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Provide patient symptoms or upload medical documents via the interactive workspace to generate intelligent clinical assessments.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
            `}} />
        </div>
    );
}