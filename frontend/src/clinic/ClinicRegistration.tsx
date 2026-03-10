import { useState } from 'react';
import {
  Building2,
  Phone,
  FileText,
  Users,
  Stethoscope,
  DollarSign,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Textarea } from '../common/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/ui/select';
import { Checkbox } from '../common/ui/checkbox';
import { Badge } from '../common/ui/badge';
import { authService } from '../services/authService';
import { toast } from 'sonner';

interface ClinicRegistrationProps {
  onBack: () => void;
}

const steps = [
  { id: 1, title: 'Basic Info', icon: Building2 },
  { id: 2, title: 'Contact', icon: Phone },
  { id: 3, title: 'Documents', icon: FileText },
  { id: 4, title: 'Staff', icon: Users },
  { id: 5, title: 'Services', icon: Stethoscope },
  { id: 6, title: 'Financial', icon: DollarSign }
];

const specializations = [
  'General Medicine', 'Cardiology', 'Pediatrics', 'Dermatology',
  'Orthopedics', 'ENT', 'Gynecology', 'Ophthalmology',
  'Dentistry', 'Physiotherapy', 'Pathology', 'Radiology'
];

const languages = [
  'Hindi', 'English', 'Marathi', 'Bengali',
  'Tamil', 'Telugu', 'Gujarati', 'Punjabi'
];

const bookingModes = ['Walk-in', 'Call Booking', 'Online Booking'];

const servicesProvided = [
  'General Checkup', 'Blood Test', 'ECG', 'X-Ray',
  'Ultrasound', 'Vaccination', 'Minor Surgery', 'Physiotherapy',
  'Dental Care', 'Eye Checkup', 'Pregnancy Care', 'Emergency Care'
];

const facilities = [
  'Wi-Fi', 'Parking', 'Wheelchair Access', 'Pharmacy',
  'Laboratory', '24/7 Emergency', 'Ambulance', 'Cafeteria',
  'Waiting Room', 'AC'
];

const paymentModes = ['Cash', 'UPI', 'Card', 'Insurance'];

export function ClinicRegistration({ onBack }: ClinicRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emergencyServices, setEmergencyServices] = useState(false);
  const [onlineConsultation, setOnlineConsultation] = useState(false);
  const [selectedBookingModes, setSelectedBookingModes] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clinicName: '',
    clinicType: '',
    establishedYear: '',
    tagline: '',
    description: '',
    address: '',
    pinCode: '',
    city: '',
    state: '',
    mobile: '',
    email: '',
    website: '',
    medicalCouncilRegNo: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    pan: '',
    gstin: '',
    password: ''
  });

  const [files, setFiles] = useState<Record<string, File>>({});
  const [customService, setCustomService] = useState('');
  const [showCustomServiceInput, setShowCustomServiceInput] = useState(false);
  const [customFacility, setCustomFacility] = useState('');
  const [showCustomFacilityInput, setShowCustomFacilityInput] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false);
  const [customSpecialization, setCustomSpecialization] = useState('');
  const [showCustomSpecializationInput, setShowCustomSpecializationInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
      toast.success(`${key} selected: ${e.target.files![0].name}`);
    }
  };

  const handleAddCustomService = () => {
    if (customService.trim()) {
      setSelectedServices(prev => [...prev, customService.trim()]);
      setCustomService('');
      setShowCustomServiceInput(false);
      toast.success("Custom service added!");
    }
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim()) {
      setSelectedFacilities(prev => [...prev, customFacility.trim()]);
      setCustomFacility('');
      setShowCustomFacilityInput(false);
      toast.success("Custom facility added!");
    }
  };

  const handleAddCustomLanguage = () => {
    if (customLanguage.trim()) {
      setSelectedLanguages(prev => [...prev, customLanguage.trim()]);
      setCustomLanguage('');
      setShowCustomLanguageInput(false);
      toast.success("Custom language added!");
    }
  };

  const handleAddCustomSpecialization = () => {
    if (customSpecialization.trim()) {
      setSelectedSpecializations(prev => [...prev, customSpecialization.trim()]);
      setCustomSpecialization('');
      setShowCustomSpecializationInput(false);
      toast.success("Custom specialization added!");
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.clinicName) newErrors.clinicName = "Clinic Name is required";
      if (!formData.clinicType) newErrors.clinicType = "Clinic Type is required";
      if (!formData.establishedYear) newErrors.establishedYear = "Established Year is required";
      if (!formData.description) newErrors.description = "Description is required";
      if (!formData.password) newErrors.password = "Password is required";
    }

    if (step === 2) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.pinCode) newErrors.pinCode = "PIN Code is required";
      else if (formData.pinCode.length !== 6) newErrors.pinCode = "PIN Code must be 6 digits";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.mobile) newErrors.mobile = "Contact Number is required";
      else if (formData.mobile.length !== 10) newErrors.mobile = "Mobile Number must be 10 digits";
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
      if (!formData.medicalCouncilRegNo) newErrors.medicalCouncilRegNo = "Medical Council Reg No is required";
    }

    if (step === 6) {
      if (!formData.accountName) newErrors.accountName = "Account Holder Name is required";
      if (!formData.accountNumber) newErrors.accountNumber = "Account Number is required";
      if (!formData.ifsc) newErrors.ifsc = "IFSC Code is required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) newErrors.ifsc = "Invalid IFSC format (e.g., SBIN0001234)";

      if (!formData.pan) newErrors.pan = "PAN Number is required";
      else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) newErrors.pan = "Invalid PAN format (e.g., ABCDE1234F)";

      if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
      toast.error("Please fill in all required fields correctly.");
    } else {
      setErrors({});
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const validateAllRequiredFields = () => {
    const errors: Record<string, string> = {};

    // Required field checks
    if (!formData.clinicName) errors.clinicName = "Clinic Name is required";
    else if (formData.clinicName.length > 150) errors.clinicName = "Clinic Name must be less than 150 characters";

    if (!formData.clinicType) errors.clinicType = "Clinic Type is required";

    if (!formData.establishedYear) errors.establishedYear = "Established Year is required";

    if (!formData.description) errors.description = "Description is required";
    else if (formData.description.length > 500) errors.description = "Description must be less than 500 characters";

    if (!formData.password) errors.password = "Password is required";

    if (!formData.address) errors.address = "Address is required";

    if (!formData.pinCode) errors.pinCode = "PIN Code is required";
    else if (formData.pinCode.length !== 6) errors.pinCode = "PIN Code must be exactly 6 digits";

    if (!formData.city) errors.city = "City is required";
    else if (formData.city.length > 100) errors.city = "City must be less than 100 characters";

    if (!formData.state) errors.state = "State is required";
    else if (formData.state.length > 100) errors.state = "State must be less than 100 characters";

    if (!formData.mobile) errors.mobile = "Contact Number is required";
    else if (formData.mobile.length !== 10) errors.mobile = "Mobile Number must be exactly 10 digits";

    if (!formData.email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email format";
    else if (formData.email.length > 150) errors.email = "Email must be less than 150 characters";

    if (!formData.medicalCouncilRegNo) errors.medicalCouncilRegNo = "Medical Council Reg No is required";
    else if (formData.medicalCouncilRegNo.length > 100) errors.medicalCouncilRegNo = "Medical Council Reg No must be less than 100 characters";

    // Optional field length checks
    if (formData.tagline && formData.tagline.length > 200) errors.tagline = "Tagline must be less than 200 characters";
    if (formData.website && formData.website.length > 200) errors.website = "Website must be less than 200 characters";

    // Bank details length checks - only validate if not empty
    if (formData.accountName && formData.accountName.length > 150) errors.accountName = "Account Holder Name must be less than 150 characters";
    if (formData.accountNumber && formData.accountNumber.length > 50) errors.accountNumber = "Account Number must be less than 50 characters";
    if (formData.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) errors.ifsc = "Invalid IFSC format";
    if (formData.pan && formData.pan.trim() !== '' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) errors.pan = "Invalid PAN format";
    if (formData.gstin && formData.gstin.trim() !== '' && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.toUpperCase())) errors.gstin = "Invalid GSTIN format";

    if (Object.keys(errors).length > 0) {
      console.error('Validation errors:', errors);
      console.log('Form data:', formData);
      setErrors(errors);

      // Show the first error in detail
      const firstError = Object.entries(errors)[0];
      toast.error(`${firstError[0]}: ${firstError[1]}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAllRequiredFields()) return;

    try {
      setLoading(true);
      await authService.signUpClinic({
        name: formData.clinicName,
        type: formData.clinicType,
        establishedYear: parseInt(formData.establishedYear),
        tagline: formData.tagline,
        description: formData.description,
        address: formData.address,
        pinCode: formData.pinCode,
        city: formData.city,
        state: formData.state,
        mobile: formData.mobile,
        email: formData.email,
        website: formData.website,
        medicalCouncilRegNo: formData.medicalCouncilRegNo,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifsc: formData.ifsc,
        pan: formData.pan.toUpperCase(),
        gstin: formData.gstin.toUpperCase()
      }, {
        services: selectedServices,
        facilities: selectedFacilities,
        paymentModes: selectedPaymentModes,
        bookingModes: selectedBookingModes
      }, formData.password, files);

      toast.success('Registration successful!');
      onBack();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register clinic');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      await authService.verifyOtp(formData.email, otp);
      toast.success('Email verified successfully! Registration complete.');
      onBack();
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const addDoctor = () => {
    setDoctors([
      ...doctors,
      {
        id: Date.now(),
        name: '',
        degrees: '',
        registration: '',
        experience: '',
        specializations: [],
        languages: []
      }
    ]);
  };

  const removeDoctor = (id: number) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="clinicName">Clinic / Hospital Name *</Label>
        <p className="text-xs text-gray-600 mt-1">As per registration certificate</p>
        <Input
          id="clinicName"
          placeholder="Clinic or Hospital name"
          className={`mt-2 ${errors.clinicName ? 'border-red-500' : ''}`}
          value={formData.clinicName}
          onChange={handleInputChange}
        />
        {errors.clinicName && <p className="text-xs text-red-500 mt-1">{errors.clinicName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="clinicType">Type *</Label>
          <Select onValueChange={(v) => handleSelectChange('clinicType', v)}>
            <SelectTrigger id="clinicType" className={`mt-2 ${errors.clinicType ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic">Clinic</SelectItem>
              <SelectItem value="hospital">Hospital</SelectItem>
              <SelectItem value="nursing_home">Nursing Home</SelectItem>
              <SelectItem value="diagnostic_center">Diagnostic Center</SelectItem>
            </SelectContent>
          </Select>
          {errors.clinicType && <p className="text-xs text-red-500 mt-1">{errors.clinicType}</p>}
        </div>

        <div>
          <Label htmlFor="establishedYear">Established Year *</Label>
          <Select onValueChange={(v) => handleSelectChange('establishedYear', v)}>
            <SelectTrigger id="establishedYear" className={`mt-2 ${errors.establishedYear ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.establishedYear && <p className="text-xs text-red-500 mt-1">{errors.establishedYear}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          placeholder="e.g., Your Health, Our Priority"
          className="mt-2"
          value={formData.tagline}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          placeholder="Describe your clinic, specialties, vision, facilities..."
          rows={4}
          className={`mt-2 ${errors.description ? 'border-red-500' : ''}`}
          value={formData.description}
          onChange={handleInputChange}
        />
        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div>
        <Label htmlFor="password">Login Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a secure password"
          className={`mt-2 ${errors.password ? 'border-red-500' : ''}`}
          value={formData.password}
          onChange={handleInputChange}
        />
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="address">Complete Address *</Label>
        <p className="text-xs text-gray-600 mt-1">Full address including building name/number</p>
        <Textarea
          id="address"
          placeholder="Complete address"
          rows={3}
          className={`mt-2 ${errors.address ? 'border-red-500' : ''}`}
          value={formData.address}
          onChange={handleInputChange}
        />
        {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pinCode">PIN Code *</Label>
          <Input
            id="pinCode"
            placeholder="6-digit PIN"
            maxLength={6}
            className={`mt-2 ${errors.pinCode ? 'border-red-500' : ''}`}
            value={formData.pinCode}
            onChange={handleInputChange}
          />
          {errors.pinCode && <p className="text-xs text-red-500 mt-1">{errors.pinCode}</p>}
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="City"
            className={`mt-2 ${errors.city ? 'border-red-500' : ''}`}
            value={formData.city}
            onChange={handleInputChange}
          />
          {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="state">State *</Label>
        <Input
          id="state"
          placeholder="State"
          className={`mt-2 ${errors.state ? 'border-red-500' : ''}`}
          value={formData.state}
          onChange={handleInputChange}
        />
        {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mobile">Contact Number *</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="mobile"
              placeholder="10-digit mobile"
              maxLength={10}
              className={`flex-1 ${errors.mobile ? 'border-red-500' : ''}`}
              value={formData.mobile}
              onChange={handleInputChange}
            />
            {!mobileVerified ? (
              <Button onClick={() => { if (formData.mobile.length === 10) setMobileVerified(true); else toast.error("Invalid mobile"); }} className="bg-pink-600 px-3 h-10">
                Verify
              </Button>
            ) : (
              <Button disabled className="bg-green-600 px-3 h-10">
                <CheckCircle className="size-4" />
              </Button>
            )}
          </div>
          {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="email"
              placeholder="Official email"
              className={`flex-1 ${errors.email ? 'border-red-500' : ''}`}
              value={formData.email}
              onChange={handleInputChange}
            />
            {!emailVerified ? (
              <Button onClick={() => { if (/\S+@\S+\.\S+/.test(formData.email)) setEmailVerified(true); else toast.error("Invalid email"); }} className="bg-pink-600 px-3 h-10">
                Verify
              </Button>
            ) : (
              <Button disabled className="bg-green-600 px-3 h-10">
                <CheckCircle className="size-4" />
              </Button>
            )}
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website (Optional)</Label>
        <Input
          id="website"
          placeholder="https://..."
          className="mt-2"
          value={formData.website}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="medicalCouncilRegNo">Medical Council Registration No. *</Label>
        <Input
          id="medicalCouncilRegNo"
          placeholder="Registration number"
          className={`mt-2 ${errors.medicalCouncilRegNo ? 'border-red-500' : ''}`}
          value={formData.medicalCouncilRegNo}
          onChange={handleInputChange}
        />
        {errors.medicalCouncilRegNo && <p className="text-xs text-red-500 mt-1">{errors.medicalCouncilRegNo}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          📄 Upload clear images or PDFs. All documents are mandatory for verification.
        </p>
      </div>

      {[
        { key: 'registration', label: 'Registration Certificate', desc: 'Click to upload' },
        { key: 'license', label: 'Medical License / Permission Letter', desc: 'MCI / State Medical Council Registration No.' },
        { key: 'idProof', label: 'Premise Proof / ID Proof', desc: 'Utility Bill / Rent Agreement / Clinic Photo' },
        { key: 'gst', label: 'GST Certificate (if applicable)', desc: 'Upload GST Certificate' }
      ].map((doc) => (
        <div key={doc.key}>
          <Label>{doc.label}</Label>
          <div className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors relative ${files[doc.key] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-pink-400'}`}>
            <input
              type="file"
              id={`file-${doc.key}`}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFileChange(doc.key, e)}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            {files[doc.key] ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="size-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 font-medium">{files[doc.key].name}</p>
                <p className="text-xs text-green-600 mt-1">{(files[doc.key].size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <Upload className="size-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">{doc.desc}</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Doctor / Staff Details</h3>
          <p className="text-sm text-gray-600">Add doctors who will be practicing at your clinic</p>
        </div>
        <Button onClick={addDoctor} className="bg-pink-600">
          <Plus className="size-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Users className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No doctors added yet</p>
          <Button onClick={addDoctor} className="bg-pink-600">
            <Plus className="size-4 mr-2" />
            Add Your First Doctor
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {doctors.map((doctor, index) => (
            <Card key={doctor.id} className="border-pink-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Doctor {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDoctor(doctor.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dr. Full Name</Label>
                  <Input placeholder="Dr. Full Name" className="mt-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Degrees</Label>
                    <Input placeholder="MBBS, MD, BDS, etc." className="mt-2" />
                  </div>
                  <div>
                    <Label>MCI / State Council No.</Label>
                    <Input placeholder="Registration number" className="mt-2" />
                  </div>
                </div>

                <div>
                  <Label>Years of Experience</Label>
                  <Input placeholder="e.g., 10" type="number" className="mt-2" />
                </div>

                <div>
                  <Label>Specializations</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {specializations.map((spec) => (
                      <div
                        key={spec}
                        onClick={() =>
                          toggleSelection(spec, selectedSpecializations, setSelectedSpecializations)
                        }
                        className={`p-2 border rounded-lg cursor-pointer text-center transition-colors ${selectedSpecializations.includes(spec)
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white border-gray-300 hover:border-pink-400'
                          }`}
                      >
                        <p className="text-xs font-medium">{spec}</p>
                      </div>
                    ))}
                    {/* Custom Specializations Display */}
                    {selectedSpecializations.filter(s => !specializations.includes(s)).map((spec) => (
                      <div
                        key={spec}
                        onClick={() => toggleSelection(spec, selectedSpecializations, setSelectedSpecializations)}
                        className="p-2 border rounded-lg cursor-pointer text-center transition-colors bg-pink-600 text-white border-pink-600"
                      >
                        <p className="text-xs font-medium">{spec}</p>
                      </div>
                    ))}

                    {/* Add Other Button */}
                    {!showCustomSpecializationInput ? (
                      <div
                        onClick={() => setShowCustomSpecializationInput(true)}
                        className="p-2 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors flex items-center justify-center"
                      >
                        <p className="text-xs font-medium text-gray-600">+ Other</p>
                      </div>
                    ) : (
                      <div className="p-2 border border-pink-200 rounded-lg bg-white flex items-center gap-2">
                        <Input
                          value={customSpecialization}
                          onChange={(e) => setCustomSpecialization(e.target.value)}
                          placeholder="Type specialization..."
                          className="h-6 text-xs"
                        />
                        <Button size="sm" onClick={handleAddCustomSpecialization} className="h-6 w-6 p-0 bg-pink-600">
                          <CheckCircle className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Languages Spoken</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {languages.map((lang) => (
                      <div
                        key={lang}
                        onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                        className={`p-2 border rounded-lg cursor-pointer text-center transition-colors ${selectedLanguages.includes(lang)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white border-gray-300 hover:border-purple-400'
                          }`}
                      >
                        <p className="text-xs font-medium">{lang}</p>
                      </div>
                    ))}
                    {/* Custom Languages Display */}
                    {selectedLanguages.filter(l => !languages.includes(l)).map((lang) => (
                      <div
                        key={lang}
                        onClick={() => toggleSelection(lang, selectedLanguages, setSelectedLanguages)}
                        className="p-2 border rounded-lg cursor-pointer text-center transition-colors bg-purple-600 text-white border-purple-600"
                      >
                        <p className="text-xs font-medium">{lang}</p>
                      </div>
                    ))}

                    {/* Add Other Button */}
                    {!showCustomLanguageInput ? (
                      <div
                        onClick={() => setShowCustomLanguageInput(true)}
                        className="p-2 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center"
                      >
                        <p className="text-xs font-medium text-gray-600">+ Other</p>
                      </div>
                    ) : (
                      <div className="p-2 border border-purple-200 rounded-lg bg-white flex items-center gap-2">
                        <Input
                          value={customLanguage}
                          onChange={(e) => setCustomLanguage(e.target.value)}
                          placeholder="Type language..."
                          className="h-6 text-xs"
                        />
                        <Button size="sm" onClick={handleAddCustomLanguage} className="h-6 w-6 p-0 bg-purple-600">
                          <CheckCircle className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="emergency"
            checked={emergencyServices}
            onCheckedChange={(checked) => setEmergencyServices(!!checked)}
          />
          <label htmlFor="emergency" className="text-sm font-medium cursor-pointer">
            24/7 Emergency Services Available
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="online"
            checked={onlineConsultation}
            onCheckedChange={(checked) => setOnlineConsultation(!!checked)}
          />
          <label htmlFor="online" className="text-sm font-medium cursor-pointer">
            Online Consultation Available
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="avgFee">Average Consultation Fee (₹)</Label>
        <Input id="avgFee" placeholder="e.g., 500" type="number" className="mt-2" />
      </div>

      <div>
        <Label>Appointment Booking Modes</Label>
        <div className="grid grid-cols-3 gap-3 mt-2">
          {bookingModes.map((mode) => (
            <div
              key={mode}
              onClick={() => toggleSelection(mode, selectedBookingModes, setSelectedBookingModes)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBookingModes.includes(mode)
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white border-gray-300 hover:border-pink-400'
                }`}
            >
              <p className="text-sm font-medium text-center">{mode}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Services Provided</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
          {servicesProvided.map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedServices.includes(service)
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white border-gray-300 hover:border-purple-400'
                }`}
            >
              <p className="text-sm font-medium">{service}</p>
            </div>
          ))}
          {/* Custom Services Display */}
          {selectedServices.filter(s => !servicesProvided.includes(s)).map((service) => (
            <div
              key={service}
              onClick={() => toggleSelection(service, selectedServices, setSelectedServices)}
              className="p-3 border rounded-lg cursor-pointer transition-colors bg-purple-600 text-white border-purple-600"
            >
              <p className="text-sm font-medium">{service}</p>
            </div>
          ))}

          {/* Add Other Button */}
          {!showCustomServiceInput ? (
            <div
              onClick={() => setShowCustomServiceInput(true)}
              className="p-3 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors flex items-center justify-center"
            >
              <p className="text-sm font-medium text-gray-600">+ Other</p>
            </div>
          ) : (
            <div className="p-3 border border-purple-200 rounded-lg bg-white flex items-center gap-2">
              <Input
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                placeholder="Type service..."
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleAddCustomService} className="h-8 w-8 p-0 bg-purple-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Facilities Available</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {facilities.map((facility) => (
            <div
              key={facility}
              onClick={() => toggleSelection(facility, selectedFacilities, setSelectedFacilities)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFacilities.includes(facility)
                ? 'bg-pink-600 text-white border-pink-600'
                : 'bg-white border-gray-300 hover:border-pink-400'
                }`}
            >
              <p className="text-sm font-medium">{facility}</p>
            </div>
          ))}
          {/* Custom Facilities Display */}
          {selectedFacilities.filter(f => !facilities.includes(f)).map((facility) => (
            <div
              key={facility}
              onClick={() => toggleSelection(facility, selectedFacilities, setSelectedFacilities)}
              className="p-3 border rounded-lg cursor-pointer transition-colors bg-pink-600 text-white border-pink-600"
            >
              <p className="text-sm font-medium">{facility}</p>
            </div>
          ))}

          {/* Add Other Button */}
          {!showCustomFacilityInput ? (
            <div
              onClick={() => setShowCustomFacilityInput(true)}
              className="p-3 border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-pink-400 hover:bg-pink-50 transition-colors flex items-center justify-center"
            >
              <p className="text-sm font-medium text-gray-600">+ Other</p>
            </div>
          ) : (
            <div className="p-3 border border-pink-200 rounded-lg bg-white flex items-center gap-2">
              <Input
                value={customFacility}
                onChange={(e) => setCustomFacility(e.target.value)}
                placeholder="Type facility..."
                className="h-8 text-sm"
              />
              <Button size="sm" onClick={handleAddCustomFacility} className="h-8 w-8 p-0 bg-pink-600">
                <CheckCircle className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Payment Modes Accepted</Label>
        <div className="grid grid-cols-4 gap-3 mt-2">
          {paymentModes.map((mode) => (
            <div
              key={mode}
              onClick={() =>
                toggleSelection(mode, selectedPaymentModes, setSelectedPaymentModes)
              }
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedPaymentModes.includes(mode)
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white border-gray-300 hover:border-purple-400'
                }`}
            >
              <p className="text-sm font-medium text-center">{mode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💰 Bank details are required for receiving payouts from online consultations
        </p>
      </div>

      <div>
        <Label htmlFor="accountName">Account Holder Name</Label>
        <p className="text-xs text-gray-600 mt-1">As per bank records</p>
        <Input
          id="accountName"
          placeholder="Account holder name"
          className="mt-2"
          value={formData.accountName}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          placeholder="Account number"
          className="mt-2"
          value={formData.accountNumber}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="ifsc">IFSC Code</Label>
        <Input
          id="ifsc"
          placeholder="e.g., SBIN0001234"
          className="mt-2"
          value={formData.ifsc}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="pan">PAN Number</Label>
        <Input
          id="pan"
          placeholder="e.g., ABCDE1234F"
          className="mt-2 uppercase"
          value={formData.pan}
          onChange={handleInputChange}
        />
      </div>

      <div>
        <Label htmlFor="gstin">GSTIN (if applicable)</Label>
        <Input
          id="gstin"
          placeholder="15-digit GSTIN"
          maxLength={15}
          className="mt-2 uppercase"
          value={formData.gstin}
          onChange={handleInputChange}
        />
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Compliance & Declaration</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox id="terms" />
            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
              I accept the Terms & Conditions and Privacy Policy of E-Clinic
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="accurate" defaultChecked />
            <label htmlFor="accurate" className="text-sm text-gray-700 cursor-pointer">
              ✅ I confirm that all the information provided is true and accurate. I understand that
              E-Clinic is not meant for collecting PII or securing sensitive data beyond what is
              necessary for healthcare services.
            </label>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">What happens next?</h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Our verification team will review your documents (24-48 hours)</li>
          <li>• You'll receive email/SMS updates on verification status</li>
          <li>• Once approved, you'll get a "✅ Verified Clinic" badge</li>
          <li>• Your clinic profile will go live on E-Clinic platform</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-bold text-gray-900 mb-2">Clinic Registration</h1>
          <p className="text-sm text-gray-600">Complete all steps to register your clinic</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`size-12 rounded-full flex items-center justify-center mb-2 ${isActive
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="size-6" />
                    ) : (
                      <span className="font-semibold">{step.id}</span>
                    )}
                  </div>
                  <p
                    className={`text-xs font-medium ${isActive ? 'text-pink-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <Card className="border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-pink-900">
              {steps[currentStep - 1].title}
              {currentStep === 2 && ' & Location'}
              {currentStep === 3 && ''}
              {currentStep === 4 && ''}
              {currentStep === 5 && ' & Facilities'}
              {currentStep === 6 && ' & Compliance'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
            {currentStep === 6 && renderStep6()}

            {/* Navigation */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="size-4 mr-2" />
                  Previous
                </Button>
              )}
              {currentStep < 6 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  Next
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  {loading ? (
                    'Registering...'
                  ) : (
                    <>
                      <CheckCircle className="size-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </Button>
              )}
              {currentStep === 1 && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}