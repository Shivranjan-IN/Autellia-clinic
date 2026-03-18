import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building2,
  Search,
  MapPin,
  Award,
  ChevronRight,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../common/ui/card';
import { Button } from '../common/ui/button';
import { Input } from '../common/ui/input';
import { Label } from '../common/ui/label';
import { Badge } from '../common/ui/badge';
import { Avatar, AvatarFallback } from '../common/ui/avatar';
import { Calendar } from '../common/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '../common/ui/tabs';
import { Textarea } from '../common/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../common/ui/dialog';
import api from "../lib/api";
import type { PatientUser } from './PatientPortal';

interface BookAppointmentProps {
  patient: PatientUser;
}

interface Doctor {
  id: number;
  full_name: string;
  qualifications?: string;
  experience_years?: number;
  bio?: string;
  email: string;
  mobile: string;
  verification_status: string;
  clinic_name?: string;
  schedule?: string[];
  fees?: number;
}

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

// Helper function to validate date
const isValidDate = (date: Date | undefined): boolean => {
  if (!date) return false;
  return !isNaN(date.getTime()) && isFinite(date.getTime());
};

export function BookAppointment({ patient }: BookAppointmentProps) {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-clinic' | 'video'>('in-clinic');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/doctors');
        const doctorsList = Array.isArray(response) ? response : (response.data || response.doctors || []);
        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctor || !selectedDate || !isValidDate(selectedDate)) return;

      setLoadingSlots(true);
      setSelectedTime('');
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(`/appointments/booked-slots/${selectedDoctor.id}/${dateStr}`);
        const bookedSlotsData = Array.isArray(response.bookedSlots) ? response.bookedSlots : (response.data?.bookedSlots || []);
        setBookedSlots(bookedSlotsData);
        if (selectedTime && bookedSlotsData.includes(selectedTime)) {
          setSelectedTime('');
        }
      } catch (error) {
        console.error('Failed to fetch booked slots:', error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDoctor, selectedDate]);

  const filteredDoctors = doctors.filter(doc =>
    doc.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.qualifications && doc.qualifications.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDoctorSelect = (doctor: typeof doctors[0]) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    // Validate that selectedDate is a valid Date
    if (!isValidDate(selectedDate)) {
      alert('Please select a valid date from the calendar.');
      return;
    }

    // Get date components and validate they are finite numbers
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    // Check if any component is NaN or infinite
    if (!isFinite(year) || !isFinite(month) || !isFinite(day)) {
      console.error('Invalid date components:', { year, month, day });
      alert('Please select a valid date from the calendar.');
      return;
    }

    // Additional check for reasonable date range
    if (year < 2020 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
      console.error('Unreasonable date values:', { year, month, day });
      alert('Please select a valid date from the calendar.');
      return;
    }

    // Create UTC date
    const utcDate = new Date(Date.UTC(year, month, day));

    // Final validation of UTC date
    if (!isValidDate(utcDate)) {
      console.error('Invalid UTC date:', utcDate);
      alert('Please select a valid date from the calendar.');
      return;
    }

    setBookingLoading(true);
    try {
      const convertTimeTo24Hour = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        if (modifier === 'PM' && hours !== '12') hours = (parseInt(hours, 10) + 12).toString();
        if (modifier === 'AM' && hours === '12') hours = '00';
        return `${hours.padStart(2, '0')}:${minutes}:00`;
      };

      const formattedTime = convertTimeTo24Hour(selectedTime);

      // Format date as YYYY-MM-DD string for backend compatibility
      // Backend expects string format, not Date object
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const appointmentData = {
        patient_id: patient.id.toString(),
        doctor_id: selectedDoctor.id,
        appointment_date: dateString,
        appointment_time: formattedTime,
        type: appointmentType === 'in-clinic' ? 'in-clinic' : 'video',
        mode: appointmentType === 'video' ? 'online' : 'offline',
        status: 'scheduled',
        consult_duration: 30,
        earnings: 500,
        reason_for_visit: reasonForVisit || null
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await api.post('/appointments', appointmentData);

      if (response.success) {
        setAppointmentId(response.data?.appointment_id);
        setStep(4);
      } else throw new Error(response.message || 'Failed to book appointment');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-semibold text-gray-900 mb-1">Book Appointment</h1>
        <p className="text-sm text-gray-600">Schedule consultation with our expert doctors</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center size-8 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 1 ? <Check className="size-4" /> : '1'}
          </div>
          <span className="text-sm font-medium">Select Doctor</span>
        </div>
        <ChevronRight className="size-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center size-8 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 2 ? <Check className="size-4" /> : '2'}
          </div>
          <span className="text-sm font-medium">Choose Date & Time</span>
        </div>
        <ChevronRight className="size-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center size-8 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 3 ? <Check className="size-4" /> : '3'}
          </div>
          <span className="text-sm font-medium">Confirm</span>
        </div>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by doctor name or qualifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="size-4 mr-2" />
              Search
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading doctors...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">No doctors found matching your search.</p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="size-16">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {doctor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{doctor.full_name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{doctor.qualifications || 'General Physician'}</p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            {doctor.experience_years && (
                              <Badge variant="outline" className="text-xs">
                                <Award className="size-3 mr-1" />
                                {doctor.experience_years} years
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {doctor.verification_status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Contact</p>
                              <p className="font-semibold text-gray-900">{doctor.mobile}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="text-sm font-medium text-blue-600">{doctor.email}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  More Info
                                </Button>
                              </DialogTrigger>
                              <DialogContent onClick={(e) => e.stopPropagation()}>
                                <DialogHeader>
                                  <DialogTitle>Doctor Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-gray-500">Name</Label>
                                    <p className="font-medium text-gray-900">{doctor.full_name}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Specialization</Label>
                                    <p className="font-medium text-gray-900">{doctor.qualifications || 'General Physician'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Experience</Label>
                                    <p className="font-medium text-gray-900">{doctor.experience_years ? `${doctor.experience_years} years` : 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Clinic</Label>
                                    <p className="font-medium text-gray-900">{doctor.clinic_name || 'Primary Clinic'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Available Schedule</Label>
                                    {doctor.schedule && doctor.schedule.length > 0 ? (
                                      <ul className="list-disc pl-5 mt-1">
                                        {doctor.schedule.map((s, i) => <li key={i} className="text-sm text-gray-800">{s}</li>)}
                                      </ul>
                                    ) : (
                                      <p className="font-medium text-gray-900">Not available</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label className="text-gray-500">Fees</Label>
                                    <p className="font-medium text-gray-900">₹{doctor.fees || 500}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDoctorSelect(doctor);
                              }}
                            >
                              Book New Appointment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Choose Date, Time & Type */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {selectedDoctor.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedDoctor.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedDoctor.qualifications || 'General Physician'}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change Doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={appointmentType} onValueChange={(v) => setAppointmentType(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="in-clinic">
                    <Building2 className="size-4 mr-2" />
                    In-Clinic Visit
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <Video className="size-4 mr-2" />
                    Video Consultation
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {appointmentType === 'in-clinic' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Elinic Healthcare Center</p>
                      <p className="text-xs text-gray-600">Andheri West, Mumbai - 400053</p>
                    </div>
                  </div>
                </div>
              )}

              {appointmentType === 'video' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Video className="size-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Online Video Consultation</p>
                      <p className="text-xs text-blue-700">Join from anywhere using your device</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="size-5" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  disabled={(date) => date < new Date()}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Select Time Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600">Loading available slots...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => {
                        const isBooked = bookedSlots.includes(time);
                        
                        // Rule: User can only book an appointment minimum 1 hour after the current time.
                        const now = new Date();
                        const [timePart, modifier] = time.split(' ');
                        let [hours, minutes] = timePart.split(':').map(Number);
                        if (modifier === 'PM' && hours !== 12) hours += 12;
                        if (modifier === 'AM' && hours === 12) hours = 0;
                        
                        const slotDateTime = selectedDate ? new Date(selectedDate) : new Date();
                        slotDateTime.setHours(hours, minutes, 0, 0);
                        
                        const isPast = slotDateTime < new Date(now.getTime() + 60 * 60 * 1000);
                        const isDisabled = isBooked || isPast;

                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : isDisabled ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => !isDisabled && setSelectedTime(time)}
                            disabled={isDisabled}
                            className={`w-full ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {time}
                            {isBooked && <span className="ml-1 text-xs">(Booked)</span>}
                            {!isBooked && isPast && <span className="ml-1 text-xs">(N/A)</span>}
                          </Button>
                        );
                      })}
                    </div>
                    {timeSlots.every(time => {
                      const isBooked = bookedSlots.includes(time);
                      const now = new Date();
                      const [timePart, modifier] = time.split(' ');
                      let [hours, minutes] = timePart.split(':').map(Number);
                      if (modifier === 'PM' && hours !== 12) hours += 12;
                      if (modifier === 'AM' && hours === 12) hours = 0;
                      const slotDateTime = selectedDate ? new Date(selectedDate) : new Date();
                      slotDateTime.setHours(hours, minutes, 0, 0);
                      return isBooked || slotDateTime < new Date(now.getTime() + 60 * 60 * 1000);
                    }) && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                        <p className="text-sm text-orange-600 font-medium">No available slots for this doctor today.</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1"
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
            >
              Continue to Confirmation
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm Booking */}
      {step === 3 && selectedDoctor && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Doctor</Label>
                  <p className="font-medium text-gray-900">{selectedDoctor.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedDoctor.qualifications || 'General Physician'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Appointment Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {appointmentType === 'video' ? (
                      <>
                        <Video className="size-4 text-blue-600" />
                        <span className="font-medium text-gray-900">Video Consultation</span>
                      </>
                    ) : (
                      <>
                        <Building2 className="size-4 text-green-600" />
                        <span className="font-medium text-gray-900">In-Clinic Visit</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Date</Label>
                  <p className="font-medium text-gray-900">
                    {selectedDate?.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Time</Label>
                  <p className="font-medium text-gray-900">{selectedTime}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Patient Name</Label>
                  <p className="font-medium text-gray-900">{patient.name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Contact</Label>
                  <p className="font-medium text-gray-900">{patient.phone}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">₹500</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">₹50</span>
                </div>
                <div className="flex justify-between items-center text-lg pt-2 border-t">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-semibold text-gray-900">₹550</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit (Optional)</Label>
                <Textarea
                  placeholder="Describe your symptoms or reason for consultation..."
                  rows={3}
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Processing...' : 'Confirm & Pay ₹550'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && selectedDoctor && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="size-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="size-8 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 mb-2">Appointment Booked Successfully!</h2>
              <p className="text-sm text-gray-600 mb-6">
                Your appointment has been confirmed. You will receive a confirmation email and SMS shortly.
              </p>

              <div className="bg-white rounded-lg p-6 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Appointment ID</p>
                    <p className="font-mono font-semibold text-gray-900">{appointmentId || `APT-2026-${Math.floor(Math.random() * 1000)}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Doctor</p>
                    <p className="font-medium text-gray-900">{selectedDoctor.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {selectedDate?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Type</p>
                    <Badge className={appointmentType === 'video' ? 'bg-blue-600' : 'bg-green-600'}>
                      {appointmentType === 'video' ? 'Video Call' : 'In-Clinic'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Download Receipt
                </Button>
                <Button className="flex-1" onClick={() => setStep(1)}>
                  Book Another Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
