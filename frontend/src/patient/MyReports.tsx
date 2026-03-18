import { useState, useEffect } from 'react';
import { patientService } from '../services/patientService';
import {
  FileText,
  Download,
  Eye,
  Upload,
  Calendar,
  ChevronDown,
  ChevronUp,
  Brain,
  Languages,
  Activity,
  TestTube,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '../common/ui/card';
import { Badge } from '../common/ui/badge';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import toast from 'react-hot-toast';
import type { PatientUser } from './PatientPortal';

interface MyReportsProps {
  patient: PatientUser;
}

export function MyReports({ patient }: MyReportsProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'documents' | 'lab'>('lab');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAIExplanation, setShowAIExplanation] = useState<string | null>(null);
  const [aiContent, setAIContent] = useState<string | null>(null);
  const [aiLoading, setAILoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [patient.id]);

  const fetchAll = async () => {
    try {
      const [docs, orders] = await Promise.all([
        patientService.getMyDocuments(),
        patientService.getMyLabOrders()
      ]);
      setDocuments(docs || []);
      setLabOrders(orders || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      await patientService.uploadDocument(file, 'Lab Report');
      toast.success('Document uploaded successfully');
      const docs = await patientService.getMyDocuments();
      setDocuments(docs || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id);

  const handleGetAIExplanation = async (reportId: string, content: string) => {
    try {
      setAILoading(true);
      setShowAIExplanation(reportId);
      const explanation = await patientService.explainReport(content, selectedLanguage);
      setAIContent(explanation);
    } catch (error) {
      setAIContent('Error generating explanation.');
    } finally {
      setAILoading(false);
    }
  };

  const toggleAIExplanation = async (reportId: string, content: string) => {
    if (showAIExplanation === reportId) {
      setShowAIExplanation(null);
      setAIContent(null);
    } else {
      await handleGetAIExplanation(reportId, content);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in progress': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredDocuments = documents.filter(d =>
    (d.document_type || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLabOrders = labOrders.filter(o =>
    (o.lab_test_types?.test_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.notes || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Lab Reports</h1>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TestTube className="size-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Lab Orders</p>
              <p className="text-xl font-bold text-blue-900">{labOrders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="size-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-900">{labOrders.filter(o => o.status === 'Completed').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="size-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-bold text-yellow-900">{labOrders.filter(o => o.status === 'Pending' || o.status === 'In Progress').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="size-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Documents</p>
              <p className="text-xl font-bold text-purple-900">{documents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('lab')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'lab' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Lab Orders ({labOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'documents' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Uploaded Documents ({documents.length})
        </button>
      </div>

      {/* Search */}
      <Input
        placeholder={`Search ${activeTab === 'lab' ? 'lab orders' : 'documents'}...`}
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {/* Lab Orders Tab */}
      {activeTab === 'lab' && (
        <div className="space-y-4">
          {filteredLabOrders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <TestTube className="size-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No lab orders found</p>
                <p className="text-sm text-gray-400 mt-1">Lab orders prescribed by your doctor will appear here</p>
              </CardContent>
            </Card>
          ) : (
            filteredLabOrders.map((order) => (
              <Card key={order.lab_order_id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <TestTube className="size-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {order.lab_test_types?.test_name || 'Lab Test'}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3.5" />
                            {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          {order.doctor && (
                            <span>Dr. {order.doctor.full_name}</span>
                          )}
                          {order.clinic && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                              {order.clinic.clinic_name}
                            </span>
                          )}
                          {order.price && (
                            <span className="font-medium text-blue-600">₹{parseFloat(order.price).toLocaleString()}</span>
                          )}
                          {order.priority && (
                            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                              {order.priority}
                            </span>
                          )}
                        </div>
                        {order.notes && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded border-l-4 border-blue-200">{order.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                      {order.result_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200"
                          onClick={() => window.open(order.result_url, '_blank')}
                        >
                          <Download className="size-4 mr-1" />
                          Download Report
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-600"
                        onClick={() => toggleExpand(order.lab_order_id)}
                      >
                        {expandedId === order.lab_order_id ? 'Hide Details' : 'View Results'}
                        {expandedId === order.lab_order_id ? <ChevronUp className="size-4 ml-1" /> : <ChevronDown className="size-4 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  {expandedId === order.lab_order_id && (
                    <div className="mt-6 pt-6 border-t space-y-6">
                      {/* Detailed Results Section */}
                      {order.lab_test_results && order.lab_test_results.length > 0 ? (
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="size-4 text-blue-600" />
                            Test Results
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {order.lab_test_results.map((result: any, idx: number) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Result</span>
                                  <Badge className={result.result_status === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                    {result.result_status || 'Normal'}
                                  </Badge>
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-gray-900">{result.result_value}</span>
                                  <span className="text-sm text-gray-500">{result.unit}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                  Normal Range: {result.normal_range}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <Clock className="size-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Results are currently being processed</p>
                          <p className="text-xs text-gray-400 mt-1">Expected soon. Please check back later.</p>
                        </div>
                      )}

                      {/* Sample Information */}
                      {order.lab_samples && order.lab_samples.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <TestTube className="size-4 text-blue-600" />
                            Sample Collection Details
                          </h4>
                          <div className="flex gap-4">
                            {order.lab_samples.map((sample: any, idx: number) => (
                              <div key={idx} className="flex-1 p-3 bg-blue-50/50 rounded-lg text-sm">
                                <div className="flex justify-between mb-1">
                                  <span className="text-gray-600">Type:</span>
                                  <span className="font-semibold text-gray-900">{sample.sample_type}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Collected:</span>
                                  <span className="text-gray-900">{new Date(sample.collected_at).toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {order.status === 'Completed' && !order.result_url && !order.lab_test_results?.length && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-500 text-center">
                      Report details will be available once uploaded by the clinic
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Uploaded Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
              <CardContent className="p-12 text-center">
                <Upload className="size-12 text-blue-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No documents uploaded yet</p>
                <p className="text-sm text-gray-400 mt-1">Upload lab reports or medical documents for AI-powered explanations</p>
                <Button
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                  onClick={() => document.getElementById('report-upload')?.click()}
                >
                  <Upload className="size-4 mr-2" />
                  Upload First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredDocuments.map((report) => (
              <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <FileText className="size-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{report.document_type || 'Medical Document'}</h3>
                          {report.uploaded_by && report.uploaded_by !== 'patient' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-wider border border-blue-200">
                              Clinic Shared
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <Calendar className="size-3.5" />
                          {new Date(report.uploaded_at || report.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="mx-1">•</span>
                          <span className="text-xs italic">
                            {report.uploaded_by && report.uploaded_by !== 'patient' ? 'Shared by Doctor' : 'Uploaded by you'}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {report.file_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(report.file_url, '_blank')}
                        >
                          <Download className="size-4 mr-1" />
                          Download
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExpand(String(report.id))}
                      >
                        <Eye className="size-4 mr-1" />
                        {expandedId === String(report.id) ? 'Hide' : 'AI Explain'}
                        {expandedId === String(report.id) ? <ChevronUp className="size-3 ml-1" /> : <ChevronDown className="size-3 ml-1" />}
                      </Button>
                    </div>
                  </div>

                  {expandedId === String(report.id) && (
                    <div className="pt-4 border-t space-y-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAIExplanation(String(report.id), report.file_url || report.document_type || '')}
                        disabled={aiLoading}
                        className="bg-purple-50 text-purple-700 border-purple-200"
                      >
                        <Brain className="size-4 mr-2" />
                        {aiLoading && showAIExplanation === String(report.id) ? 'Analyzing...' : (showAIExplanation === String(report.id) ? 'Hide Explanation' : 'Get AI Explanation')}
                      </Button>

                      {showAIExplanation === String(report.id) && (
                        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Brain className="size-4 text-purple-600" />
                              <span className="font-medium text-gray-900 text-sm">AI-Powered Explanation</span>
                            </div>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                              <SelectTrigger className="w-[130px] h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="English">
                                  <div className="flex items-center gap-1"><Languages className="size-3" /> English</div>
                                </SelectItem>
                                <SelectItem value="Hindi">
                                  <div className="flex items-center gap-1"><Languages className="size-3" /> हिंदी</div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
                            {aiLoading ? (
                              <div className="flex items-center gap-2 text-purple-600">
                                <Clock className="size-4 animate-spin" />
                                Analyzing your report...
                              </div>
                            ) : (
                              <div className="whitespace-pre-line">{aiContent}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
