import { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    Eye,
    Trash2,
    User,
    Plus,
    X,
    ExternalLink,
    Paperclip,
    CheckCircle
} from 'lucide-react';
import { doctorService } from '../services/doctorService';
import { patientService } from '../services/patientService';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '../common/ui/card';
import { Badge } from '../common/ui/badge';

export function PatientDocuments() {
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [patientsLoading, setPatientsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Upload form state
    const [uploadData, setUploadData] = useState({
        file: null as File | null,
        type: 'Report'
    });

    const docTypes = [
        'Report',
        'X-Ray',
        'Prescription',
        'Lab Result',
        'External',
        'Discharge Summary',
        'Consent Form',
        'Other'
    ];

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setPatientsLoading(true);
            const data = await patientService.getPatients();
            setPatients(data);
        } catch (error) {
            toast.error('Failed to load patients list');
        } finally {
            setPatientsLoading(false);
        }
    };

    const fetchDocuments = async (patientId: string) => {
        if (!patientId) return;
        try {
            setLoading(true);
            const data = await doctorService.getPatientDocuments(patientId);
            setDocuments(data);
        } catch (error) {
            toast.error('Failed to load patient records');
        } finally {
            setLoading(false);
        }
    };

    const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pId = e.target.value;
        console.log('Selected Patient ID:', pId);
        setSelectedPatientId(pId);
        if (pId) {
            fetchDocuments(pId);
        } else {
            setDocuments([]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Attempting upload for:', selectedPatientId, 'Type:', uploadData.type);
        if (!selectedPatientId) return toast.error('Please select a patient first');
        if (!uploadData.file) return toast.error('Please select a file');

        try {
            setUploading(true);
            await doctorService.uploadPatientDocument(selectedPatientId, uploadData.file, uploadData.type);
            toast.success('Document uploaded successfully');
            setShowUploadModal(false);
            setUploadData({ file: null, type: 'Report' });
            fetchDocuments(selectedPatientId);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId: number) => {
        if (!window.confirm('Delete this clinical record definitively?')) return;
        try {
            await doctorService.deletePatientDocument(docId);
            toast.success('Document removed');
            fetchDocuments(selectedPatientId);
        } catch (error) {
            toast.error('Deletion failed');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm tracking-wide uppercase">
                        <FileText className="w-4 h-4" />
                        <span>Medical Records Hub</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Patient Documents</h1>
                    <p className="text-slate-500 max-w-lg font-medium">
                        Manage external reports, X-rays, and clinical documentation with encrypted cloud storage.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                     <button
                        onClick={() => selectedPatientId ? setShowUploadModal(true) : toast.error('Select a patient first')}
                        className="flex items-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02]"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Upload New Record</span>
                    </button>
                </div>
            </div>

            {/* Selection Bar */}
            <Card className="border-slate-200 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Select Target Patient</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <select
                                    value={selectedPatientId}
                                    onChange={handlePatientChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-[1.25rem] pl-14 pr-6 py-4 text-sm text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all appearance-none cursor-pointer"
                                    disabled={patientsLoading}
                                >
                                    <option value="">{patientsLoading ? 'Syncing patient list...' : 'Choose a patient from your registry'}</option>
                                    {patients.map(p => (
                                        <option key={p.patient_id} value={p.patient_id}>
                                            {p.full_name} ({p.patient_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedPatientId && (
                            <div className="flex items-center gap-6 px-8 py-4 bg-blue-50 border border-blue-100 rounded-[1.5rem] animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active File Count</p>
                                    <p className="text-2xl font-black text-slate-900">{documents.length}</p>
                                </div>
                                <div className="h-10 w-px bg-blue-200/50" />
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Total Patient Data</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {formatFileSize(documents.reduce((acc, d) => acc + (d.file_size || 0), 0))}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Document Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {!selectedPatientId ? (
                    <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-300 rounded-[3rem]">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <User className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">Patient Selection Required</h3>
                            <p className="text-sm text-slate-500 font-medium">Please select a patient from the dropdown above to view or manage their clinical documents.</p>
                        </div>
                    </div>
                ) : loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-100 rounded-[2rem] animate-pulse" />
                    ))
                ) : documents.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-300 rounded-[3rem]">
                        <div className="max-w-xs mx-auto space-y-4">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                <Plus className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900">No Documents Found</h3>
                            <p className="text-sm text-slate-500 font-medium">This patient currently has no associated clinical documents or reports.</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="text-blue-600 font-bold text-sm hover:underline"
                            >
                                Upload first document
                            </button>
                        </div>
                    </div>
                ) : (
                    documents.map((doc) => (
                        <Card key={doc.id} className="group border-slate-200 rounded-[2rem] hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 overflow-hidden relative">
                             {/* Floating actions */}
                             <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-10">
                                <button
                                    onClick={() => window.open(doc.file_url, '_blank')}
                                    className="p-2.5 bg-white border border-slate-100 rounded-xl text-blue-600 shadow-xl hover:bg-blue-600 hover:text-white transition-all scale-90 hover:scale-100"
                                    title="Open Document"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="p-2.5 bg-white border border-slate-100 rounded-xl text-rose-500 shadow-xl hover:bg-rose-600 hover:text-white transition-all scale-90 hover:scale-100"
                                    title="Delete Record"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <CardContent className="p-0">
                                <div className="h-40 bg-slate-50 flex items-center justify-center relative overflow-hidden group/thumb">
                                     <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5" />
                                     <FileText className="w-16 h-16 text-slate-200 transition-transform duration-700 group-hover/thumb:scale-110 group-hover/thumb:text-blue-100" />
                                     <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-slate-50 to-transparent" />
                                     <Badge className="absolute bottom-4 left-4 bg-white text-slate-900 border-slate-200 font-bold uppercase text-[9px] tracking-widest py-1 px-3">
                                         {doc.document_type}
                                     </Badge>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-slate-900 truncate leading-tight" title={doc.file_name}>
                                            {doc.file_name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(doc.file_size)}</span>
                                        </div>
                                    </div>
                                    
                                    <button
                                        onClick={() => window.open(doc.file_url, '_blank')}
                                        className="w-full py-3 bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-600 font-bold text-xs rounded-xl transition-all border border-slate-100 flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Quick Preview
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowUploadModal(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">Upload Clinical Record</h2>
                                <p className="text-sm text-slate-500 font-medium">Attach PDF, image, or X-ray files</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-8 space-y-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Document Classification</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {docTypes.map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setUploadData({ ...uploadData, type })}
                                            className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${uploadData.type === type
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-500/50 hover:text-blue-600'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Select File</label>
                                <div 
                                    className={`relative group h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${uploadData.file 
                                        ? 'border-emerald-500 bg-emerald-50/50' 
                                        : 'border-slate-200 bg-slate-50 hover:border-blue-500/50 hover:bg-blue-50/50'}`}
                                >
                                    <input
                                        type="file"
                                        onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    {uploadData.file ? (
                                        <>
                                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-3 shadow-lg shadow-emerald-500/10">
                                                <Paperclip className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-emerald-700 text-sm">{uploadData.file.name}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 mt-1">{formatFileSize(uploadData.file.size)}</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mb-3 shadow-sm group-hover:scale-110 group-hover:text-blue-400 transition-all">
                                                <Upload className="w-8 h-8" />
                                            </div>
                                            <p className="font-bold text-slate-500 text-sm">Click or drag record here</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">MAX 20MB • PDF, JPG, PNG</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !uploadData.file}
                                className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 flex items-center justify-center gap-3"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Encrypting & Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Confirm Secure Upload</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
