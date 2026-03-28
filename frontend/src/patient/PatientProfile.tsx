import { useState, useEffect, useRef } from 'react';
import { patientService } from '../services/patientService';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Activity,
  Edit,
  Save,
  Shield,
  Upload,
  File,
  Eye,
  X,
  Plus,
  Droplet,
  AlertTriangle,
  Pill,
  Download,
  Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Textarea } from '../common/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../common/ui/avatar';
import { Badge } from '../common/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../common/ui/tabs';
import type { PatientUser } from './PatientPortal';

interface PatientProfileProps {
  patient: PatientUser;
  onProfileUpdate?: (updatedPatient: PatientUser) => void;
}


export function PatientProfile({ patient: initialPatient, onProfileUpdate }: PatientProfileProps) {
  const [patient, setPatient] = useState(initialPatient);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: initialPatient.name || '',
    email: initialPatient.email || '',
    phone: initialPatient.phone || '',
    age: initialPatient.age || 0,
    gender: initialPatient.gender || 'Male',
    blood_group: initialPatient.bloodGroup || 'O+',
    address: initialPatient.address || '',
    abha_id: initialPatient.abhaId || '',
    insurance_id: initialPatient.insuranceId || '',
    date_of_birth: initialPatient.dob 
      ? (typeof initialPatient.dob === 'string' ? initialPatient.dob.split('T')[0] : initialPatient.dob.toISOString().split('T')[0])
      : ''
  });
  // Initialize medical data from patient prop or default to empty arrays
  const [allergies, setAllergies] = useState<string[]>(initialPatient.allergies || []);
  const [medications, setMedications] = useState<string[]>(initialPatient.currentMedications || []);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>(initialPatient.chronicDiseases || []);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newDisease, setNewDisease] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docUploading, setDocUploading] = useState(false);
  const [docType, setDocType] = useState('Medical Record');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPatient(initialPatient);
    setFormData({
      full_name: initialPatient.name || '',
      email: initialPatient.email || '',
      phone: initialPatient.phone || '',
      age: initialPatient.age || 0,
      gender: initialPatient.gender || 'Male',
      blood_group: initialPatient.bloodGroup || 'O+',
      address: initialPatient.address || '',
      abha_id: initialPatient.abhaId || '',
      insurance_id: initialPatient.insuranceId || '',
      date_of_birth: initialPatient.dob 
        ? (typeof initialPatient.dob === 'string' ? initialPatient.dob.split('T')[0] : initialPatient.dob.toISOString().split('T')[0])
        : ''
    });
    // Sync medical data from patient prop
    setAllergies(initialPatient.allergies || []);
    setMedications(initialPatient.currentMedications || []);
    setChronicDiseases(initialPatient.chronicDiseases || []);
  }, [initialPatient]);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await patientService.getMyDocuments();
      setDocuments(data || []);
    } catch (e) {
      console.error('Error fetching documents:', e);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setDocUploading(true);
      await patientService.uploadDocument(file, docType);
      await fetchDocuments();
    } catch (err: any) {
      console.error('Error uploading document:', err);
    } finally {
      setDocUploading(false);
      if (docFileInputRef.current) docFileInputRef.current.value = '';
    }
  };

  const handleDocumentDelete = async (docId: number) => {
    try {
      await patientService.deleteDocument(docId);
      setDocuments(docs => docs.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Include medical data in the update to database
      const updated = await patientService.updatePatientProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender,
        blood_group: formData.blood_group,
        address: formData.address,
        abha_id: formData.abha_id,
        insurance_id: formData.insurance_id,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : undefined,
        allergies: allergies,
        chronicDiseases: chronicDiseases,
        currentMedications: medications
      });
      if (updated) {
        setIsEditing(false);
        // Update local patient state with the returned data from database
        const updatedPatient: PatientUser = {
          ...patient,
          name: updated.full_name || patient.name,
          phone: updated.phone || patient.phone,
          age: updated.age || patient.age,
          gender: updated.gender || patient.gender,
          bloodGroup: updated.blood_group || patient.bloodGroup,
          address: updated.address || patient.address,
          abhaId: updated.abha_id || patient.abhaId,
          insuranceId: updated.insurance_id || patient.insuranceId,
          dob: updated.date_of_birth || patient.dob,
          allergies: updated.allergies || allergies,
          chronicDiseases: updated.chronicDiseases || chronicDiseases,
          currentMedications: updated.currentMedications || medications
        };
        setPatient(updatedPatient);
        // Notify parent component about the update
        if (onProfileUpdate) {
          onProfileUpdate(updatedPatient);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = (
    value: string,
    setValue: (v: string) => void,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    if (value.trim()) {
      setItems([...items, value.trim()]);
      setValue('');
    }
  };

  const handleRemoveItem = (
    index: number,
    items: string[],
    setItems: (items: string[]) => void
  ) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const updated = await patientService.uploadProfilePhoto(file);
      if (updated && updated.profile_photo_url) {
        const updatedPatient: PatientUser = {
          ...patient,
          avatar: updated.profile_photo_url
        };
        setPatient(updatedPatient);
        if (onProfileUpdate) {
          onProfileUpdate(updatedPatient);
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-semibold text-gray-900 mb-1">My Profile</h1>
          <p className="text-sm text-gray-600">Manage your personal and medical information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form to current patient state
                  setFormData({
                    full_name: patient.name || '',
                    email: patient.email || '',
                    phone: patient.phone || '',
                    age: patient.age || 0,
                    gender: patient.gender || 'Male',
                    blood_group: patient.bloodGroup || 'O+',
                    address: patient.address || '',
                    abha_id: patient.abhaId || '',
                    insurance_id: patient.insuranceId || '',
                    date_of_birth: patient.dob
                      ? (typeof patient.dob === 'string' ? patient.dob.split('T')[0] : patient.dob.toISOString().split('T')[0])
                      : ''
                  });
                  setAllergies(patient.allergies || []);
                  setMedications(patient.currentMedications || []);
                  setChronicDiseases(patient.chronicDiseases || []);
                }}
              >
                <X className="size-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-pink-600 to-purple-600 text-white"
              >
                {saving ? (
                  <>
                    <Save className="size-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-pink-300 text-pink-700 hover:bg-pink-50"
            >
              <Edit className="size-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1 border-pink-200">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24 mb-4">
                {patient.avatar ? (
                  <AvatarImage src={patientService.getFullUrl(patient.avatar)} alt={patient.name} />
                ) : (
                  <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-2xl">
                    {patient.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="font-semibold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{patient.email}</p>

              {patient.abhaId && (
                <div className="w-full p-3 bg-pink-50 rounded-lg mb-4 border border-pink-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Shield className="size-4 text-pink-600" />
                    <p className="text-xs font-medium text-pink-900">ABHA ID</p>
                  </div>
                  <p className="text-sm font-mono text-pink-700">{patient.abhaId}</p>
                </div>
              )}

              <div className="w-full space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="size-4 text-gray-400" />
                  <span className="text-gray-700">{patient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-gray-400" />
                  <span className="text-gray-700">{patient.age} years old</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-gray-400" />
                  <span className="text-gray-700">{patient.address || 'Location N/A'}</span>
                </div>
              </div>

              {!isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    className="w-full mt-6"
                    variant="outline"
                    onClick={triggerFileInput}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Camera className="size-4 mr-2 animate-pulse" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="size-4 mr-2" />
                        Upload Photo
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="lg:col-span-2 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-900">Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">
                  <User className="size-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="medical">
                  <Heart className="size-4 mr-2" />
                  Medical
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <File className="size-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-4">
                {!isEditing && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-700">
                    <Edit className="size-4 shrink-0" />
                    Click <strong>Edit Profile</strong> above to make changes.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (read-only)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="mt-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50'}`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50'}`}
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <select
                        id="gender"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="mt-2 w-full h-10 px-3 rounded-md border border-pink-400 ring-1 ring-pink-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <Input id="gender" value={formData.gender} disabled className="mt-2 bg-gray-50" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    {isEditing ? (
                      <select
                        id="bloodGroup"
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        className="mt-2 w-full h-10 px-3 rounded-md border border-pink-400 ring-1 ring-pink-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <Input id="bloodGroup" value={formData.blood_group} disabled className="mt-2 bg-gray-50" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50'}`}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Residential Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className={`mt-2 ${isEditing ? 'border-pink-400 ring-1 ring-pink-300' : 'bg-gray-50'}`}
                    placeholder="Enter your full address"
                  />
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6 mt-4">
                <Card className="border-pink-200 bg-pink-50">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="size-5 text-pink-600" />
                      Medical Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* ABHA ID */}
                    <div>
                      <Label>ABHA Health ID</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          value={formData.abha_id}
                          onChange={(e) => setFormData({ ...formData, abha_id: e.target.value })}
                          disabled={!isEditing}
                          className="font-mono bg-white"
                        />
                        <Badge className="bg-green-600">Verified</Badge>
                      </div>
                    </div>
                    {/* Insurance ID */}
                    <div>
                      <Label>Insurance ID</Label>
                      <Input
                        value={formData.insurance_id}
                        onChange={(e) => setFormData({ ...formData, insurance_id: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2 bg-white"
                        placeholder="Enter your Insurance ID"
                      />
                    </div>

                    {/* Blood Group */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Droplet className="size-4 text-pink-600" />
                        Blood Group
                      </Label>
                      <Input
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        disabled={!isEditing}
                        className="mt-2 bg-white"
                      />
                    </div>

                    {/* Allergies */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <AlertTriangle className="size-4 text-orange-600" />
                        Allergies
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {allergies.map((allergy, index) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {allergy}
                              {isEditing && (
                                <button
                                  onClick={() => handleRemoveItem(index, allergies, setAllergies)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="size-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add allergy"
                              value={newAllergy}
                              onChange={(e) => setNewAllergy(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItem(newAllergy, setNewAllergy, allergies, setAllergies);
                                }
                              }}
                              className="bg-white"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(newAllergy, setNewAllergy, allergies, setAllergies)}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Current Medications */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Pill className="size-4 text-blue-600" />
                        Current Medications
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {medications.map((medication, index) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {medication}
                              {isEditing && (
                                <button
                                  onClick={() => handleRemoveItem(index, medications, setMedications)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="size-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add medication"
                              value={newMedication}
                              onChange={(e) => setNewMedication(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItem(newMedication, setNewMedication, medications, setMedications);
                                }
                              }}
                              className="bg-white"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(newMedication, setNewMedication, medications, setMedications)}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chronic Diseases */}
                    <div>
                      <Label className="flex items-center gap-2">
                        <Activity className="size-4 text-purple-600" />
                        Chronic Diseases
                      </Label>
                      <div className="mt-2 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {chronicDiseases.map((disease, index) => (
                            <Badge key={index} variant="outline" className="bg-white">
                              {disease}
                              {isEditing && (
                                <button
                                  onClick={() => handleRemoveItem(index, chronicDiseases, setChronicDiseases)}
                                  className="ml-2 hover:text-red-600"
                                >
                                  <X className="size-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                        {isEditing && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add chronic disease and press Enter"
                              value={newDisease}
                              onChange={(e) => setNewDisease(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItem(newDisease, setNewDisease, chronicDiseases, setChronicDiseases);
                                }
                              }}
                              className="bg-white"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleAddItem(newDisease, setNewDisease, chronicDiseases, setChronicDiseases)}
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isEditing && (
                  <Button 
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                  >
                    <Save className="size-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Medical Details'}
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-6 mt-4">
                {/* Upload Section */}
                <Card className="border-2 border-dashed border-pink-300 bg-pink-50">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className="p-4 bg-pink-100 rounded-full">
                          <Upload className="size-8 text-pink-600" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Upload Documents</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload Medical Records, Insurance Card, or other documents
                      </p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <select
                          value={docType}
                          onChange={e => setDocType(e.target.value)}
                          className="border border-pink-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-400"
                        >
                          {['Medical Record', 'Insurance', 'Lab Report', 'Prescription', 'Other'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <input
                          type="file"
                          ref={docFileInputRef}
                          onChange={handleDocumentUpload}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                        />
                        <Button
                          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                          onClick={() => docFileInputRef.current?.click()}
                          disabled={docUploading}
                        >
                          <Upload className="size-4 mr-2" />
                          {docUploading ? 'Uploading...' : 'Choose File'}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents List */}
                <div className="space-y-3">
                  {documents.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">No documents uploaded yet.</p>
                  ) : (
                    documents.map((doc) => (
                      <Card key={doc.id} className="border-pink-200 hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-pink-100 rounded-lg">
                                <File className="size-5 text-pink-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{doc.file_name}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {doc.document_type}
                                  </Badge>
                                  <span>{doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}</span>
                                  {doc.file_size && <span>{Math.round(doc.file_size / 1024)} KB</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.file_url && (
                                <Button size="sm" variant="outline" onClick={() => window.open(doc.file_url, '_blank')}>
                                  <Eye className="size-4 mr-1" />
                                  View
                                </Button>
                              )}
                              {doc.file_url && (
                                <a href={doc.file_url} download={doc.file_name}>
                                  <Button size="sm" variant="outline" className="bg-pink-50 border-pink-300 text-pink-600 hover:bg-pink-100">
                                    <Download className="size-4 mr-1" />
                                    Download
                                  </Button>
                                </a>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDocumentDelete(doc.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
