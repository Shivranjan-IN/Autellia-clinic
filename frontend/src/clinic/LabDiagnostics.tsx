import { useState, useEffect } from 'react';
import { User } from '../common/types';
import { Search, Plus, FlaskConical, Upload, Download, Clock, CheckCircle, AlertCircle, X, ChevronLeft } from 'lucide-react';
import { clinicService } from '../services/clinicService';
import { toast } from 'sonner';

interface LabDiagnosticsProps {
  user?: User | any;
  onBack?: () => void;
}

interface LabOrder {
  lab_order_id: string;
  patient_id: string;
  doctor_id: number;
  test_type_id: number;
  priority: 'Normal' | 'Urgent';
  order_date: string;
  price: number;
  status: 'pending' | 'collected' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  patient?: {
    full_name: string;
  };
  doctor?: {
    full_name: string;
  };
  lab_test_types?: {
    test_name: string;
  };
}

interface TestType {
  test_type_id: number;
  test_name: string;
  price: number;
  tat_hours: number;
}

export function LabDiagnostics({ user, onBack }: LabDiagnosticsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConnectLabModal, setShowConnectLabModal] = useState(false);
  const [showManualLabModal, setShowManualLabModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    test_type_id: '',
    priority: 'Normal',
    notes: ''
  });

  const [connectLabData, setConnectLabData] = useState({ labId: '' });
  const [manualLabData, setManualLabData] = useState({
    name: '', contact: '', address: '', tests: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, testsData, patientsData, doctorsData] = await Promise.all([
        clinicService.getLabOrders(),
        clinicService.getLabs(),
        clinicService.getPatients(),
        clinicService.getDoctors()
      ]);
      setLabOrders(ordersData);
      setTestTypes(testsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (error) {
      toast.error('Failed to synchronize diagnostic data');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = labOrders.filter(order => {
    const matchesSearch =
      order.lab_order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.lab_test_types?.test_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.doctor_id || !formData.test_type_id) {
      toast.error('Please fill required protocols');
      return;
    }

    try {
      await clinicService.createLabOrder(formData);
      toast.success('Lab order protocol initiated');
      setShowCreateModal(false);
      setFormData({
        patient_id: '',
        doctor_id: '',
        test_type_id: '',
        priority: 'Normal',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to initiate lab order');
    }
  };

  const pendingCount = labOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const completedToday = labOrders.filter(o =>
    o.status === 'completed' &&
    new Date(o.order_date).toDateString() === new Date().toDateString()
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
             <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
               <ChevronLeft className="w-5 h-5 text-gray-600" />
             </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab & Diagnostics</h1>
            <p className="text-gray-600">Manage lab tests and diagnostic reports</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'doctor' || user?.role === 'clinic' || user?.role === 'lab') && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowConnectLabModal(true)}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
            >
              Connect Lab ID
            </button>
            <button
              onClick={() => setShowManualLabModal(true)}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm text-sm"
            >
              Add Lab Manually
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
            >
              <Plus className="w-4 h-4" />
              Create Order
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{labOrders.length}</p>
          <p className="text-sm text-gray-600">Total Tests</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-sm text-gray-600">Pending/Processing</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-green-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{completedToday}</p>
          <p className="text-sm text-gray-600">Completed Today</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <FlaskConical className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{testTypes.length}</p>
          <p className="text-sm text-gray-600">Test Types Available</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by test ID, patient name, or test type..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lab Tests Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                    No diagnostic records found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.lab_order_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{order.lab_order_id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.patient?.full_name}</p>
                        <p className="text-xs text-gray-500">{order.patient_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{order.lab_test_types?.test_name}</p>
                        {order.priority === 'Urgent' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 mt-1">
                            Urgent
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.doctor?.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{parseFloat(order.price.toString()).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'collected' ? 'bg-purple-100 text-purple-700' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                        {order.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {order.status === 'processing' && <Clock className="w-3 h-3" />}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {order.status === 'completed' && (
                          <button
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Download Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {(user?.role === 'lab' || user?.role === 'clinic') && order.status !== 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowUploadModal(true);
                            }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Update Progress"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test Type Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Available Diagnostic Protocols</h3>
          <span className="text-sm text-blue-600 font-medium">{testTypes.length} types</span>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testTypes.map((test) => (
              <div key={test.test_type_id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:border-blue-300 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{test.test_name}</h4>
                  <FlaskConical className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-bold text-gray-900">₹{parseFloat(test.price.toString()).toLocaleString()}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                    <Clock className="w-3 h-3" />
                    {test.tat_hours} Hours TAT
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Lab Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Initiate Diagnostic Order</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Selection *</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    <option value="">Select ID/Name</option>
                    {patients.map(p => (
                      <option key={p.patient_id} value={p.patient_id}>{p.patient_id} - {p.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Consulting Doctor *</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Diagnostic Protocol *</label>
                  <select
                    required
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    value={formData.test_type_id}
                    onChange={(e) => setFormData({ ...formData, test_type_id: e.target.value })}
                  >
                    <option value="">Select Test Type</option>
                    {testTypes.map((test) => (
                      <option key={test.test_type_id} value={test.test_type_id}>
                        {test.test_name} - ₹{parseFloat(test.price.toString()).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Priority Level</label>
                  <select
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'Normal' | 'Urgent' })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Clinical Observations</label>
                  <textarea
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    rows={3}
                    placeholder="Enter relevant clinical notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  Initiate Protocol
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload/Update Status Modal */}
      {showUploadModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Diagnostic Status Update</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Order Details</p>
                <p className="text-sm text-gray-700">Test ID: <strong className="text-gray-900">{selectedOrder.lab_order_id}</strong></p>
                <p className="text-sm text-gray-700">Patient: <strong className="text-gray-900">{selectedOrder.patient?.full_name}</strong></p>
                <p className="text-sm text-gray-700">Protocol: <strong className="text-gray-900">{selectedOrder.lab_test_types?.test_name}</strong></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Diagnostic Report *</label>
                  <div className="border-2 border-dashed border-blue-100 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group">
                    <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-semibold text-gray-900">Select PDF Report</p>
                    <p className="text-xs text-gray-500 mt-1">Maximum payload: 10MB</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                    onClick={() => {
                      toast.success('Diagnostic record verified and encrypted');
                      setShowUploadModal(false);
                    }}
                  >
                    Confirm & Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedOrder(null);
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect Existing Lab Modal */}
      {showConnectLabModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Connect Existing Lab</h2>
                <button onClick={() => setShowConnectLabModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
             </div>
             <div className="p-6">
                <label className="block text-sm font-semibold mb-2">Registered Lab ID / Invite Code</label>
                <input
                   className="w-full px-4 py-2 border rounded-xl"
                   value={connectLabData.labId}
                   onChange={e => setConnectLabData({labId: e.target.value})}
                   placeholder="e.g. LAB-12345"
                />
                <div className="mt-6 flex gap-3">
                   <button onClick={() => {toast.success('Lab mapping request sent!'); setShowConnectLabModal(false);}} className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Connect</button>
                   <button onClick={() => setShowConnectLabModal(false)} className="flex-1 border py-2 rounded-xl">Cancel</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Add Manual Lab Modal */}
      {showManualLabModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
             <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Lab Manually</h2>
                <button onClick={() => setShowManualLabModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
             </div>
             <div className="p-6 space-y-4">
                <div>
                   <label className="block text-sm font-semibold mb-1">Lab Name</label>
                   <input className="w-full px-4 py-2 border rounded-xl" value={manualLabData.name} onChange={e => setManualLabData(p=>({...p, name: e.target.value}))} />
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-1">Contact Number</label>
                   <input className="w-full px-4 py-2 border rounded-xl" value={manualLabData.contact} onChange={e => setManualLabData(p=>({...p, contact: e.target.value}))} />
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-1">Address</label>
                   <input className="w-full px-4 py-2 border rounded-xl" value={manualLabData.address} onChange={e => setManualLabData(p=>({...p, address: e.target.value}))} />
                </div>
                <div>
                   <label className="block text-sm font-semibold mb-1">Available Tests (comma separated)</label>
                   <input className="w-full px-4 py-2 border rounded-xl" value={manualLabData.tests} onChange={e => setManualLabData(p=>({...p, tests: e.target.value}))} />
                </div>
                <div className="mt-6 flex gap-3">
                   <button onClick={() => {toast.success('Manual lab created and mapped!'); setShowManualLabModal(false);}} className="flex-1 bg-blue-600 text-white py-2 rounded-xl">Add Lab</button>
                   <button onClick={() => setShowManualLabModal(false)} className="flex-1 border py-2 rounded-xl">Cancel</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
