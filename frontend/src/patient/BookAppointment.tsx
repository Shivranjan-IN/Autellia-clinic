import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Building2,
  Search,
  MapPin,
  Award,
  ChevronRight,
  Check,
  X
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
import api from "../services/api";
import type { PatientUser } from './PatientPortal';

interface BookAppointmentProps {
  patient: PatientUser;
}

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  experience_years: number;
  fees: number;
  profile_photo_url?: string;
  languages?: string[];
  qualifications?: string;
  address?: string;
  clinic_name?: string;
  clinic_address?: string;
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

// Get tomorrow's date (safe default — never disabled by the calendar)
const getTomorrow = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export function BookAppointment({ patient }: BookAppointmentProps) {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-clinic' | 'video'>('in-clinic');
  // FIX: default to tomorrow so the date is never in the "disabled" range
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(getTomorrow());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // ─── Fetch doctors list ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchDoctors = async () => {
      setFetchError(null);
      try {
        // /doctors/public — intentionally unauthenticated so patients can browse
        const response = await api.get('/doctors/public');
        // Axios wraps response body as response.data
        // Backend returns { success: true, data: [...] }
        const doctorsList =
          response.data?.data ||
          response.data?.doctors ||
          (Array.isArray(response.data) ? response.data : []);
        setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
      } catch (error: any) {
        const status = error?.response?.status;
        const msg = error?.response?.data?.message || error?.message || 'Unknown error';
        console.error('Failed to fetch doctors:', status, msg);
        setFetchError(`Could not load doctors (${status ?? 'network error'}). Please refresh.`);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // ─── Fetch booked slots when doctor or date changes ───────────────────────
  useEffect(() => {
    if (!selectedDoctor || !selectedDate || !isValidDate(selectedDate)) return;

    let cancelled = false;

    const fetchBookedSlots = async () => {
      setLoadingSlots(true);
      // Reset time selection when date/doctor changes
      setSelectedTime('');
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await api.get(
          `/appointments/booked-slots/${selectedDoctor.id}/${dateStr}?patientId=${patient.id}`
        );
        // FIX: Axios wraps body in response.data — response.bookedSlots doesn't exist
        const slotsData: string[] =
          response.data?.bookedSlots ||
          response.data?.data?.bookedSlots ||
          (Array.isArray(response.data?.data) ? response.data.data : []);

        if (!cancelled) {
          setBookedSlots(Array.isArray(slotsData) ? slotsData : []);
        }
      } catch (error: any) {
        console.error('Failed to fetch booked slots:', error?.response?.status, error?.message);
        if (!cancelled) setBookedSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
    return () => { cancelled = true; };
  }, [selectedDoctor?.id, selectedDate?.toISOString().split('T')[0]]);

  // ─── Derived state ────────────────────────────────────────────────────────
  // FIX: also search by specialization
  const filteredDoctors = doctors.filter(doc => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      doc.full_name.toLowerCase().includes(q) ||
      (doc.specialization && doc.specialization.toLowerCase().includes(q)) ||
      (doc.qualifications && doc.qualifications.toLowerCase().includes(q)) ||
      (doc.clinic_name && doc.clinic_name.toLowerCase().includes(q))
    );
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const resetBooking = () => {
    // FIX: fully reset all state when starting a new booking
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate(getTomorrow());
    setSelectedTime('');
    setAppointmentType('in-clinic');
    setReasonForVisit('');
    setAppointmentId('');
    setBookedSlots([]);
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    if (!isValidDate(selectedDate)) {
      alert('Please select a valid date from the calendar.');
      return;
    }

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();

    if (!isFinite(year) || !isFinite(month) || !isFinite(day)) {
      alert('Please select a valid date from the calendar.');
      return;
    }

    if (year < 2020 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31) {
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
        earnings: selectedDoctor.fees || 500,
        reason_for_visit: reasonForVisit || null
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await api.post('/appointments', appointmentData);

      // FIX: Axios wraps body in response.data — response.success doesn't exist
      if (response.data?.success || response.status === 200 || response.status === 201) {
        const newId =
          response.data?.data?.appointment_id ||
          response.data?.appointment_id ||
          `APT-${Date.now()}`;
        setAppointmentId(newId);
        setStep(4);
      } else {
        throw new Error(response.data?.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to book appointment. Please try again.';
      console.error('Error booking appointment:', error);
      alert(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const downloadReceiptAsImage = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: '#F0FDF4',
          scale: 2,
          useCORS: true,
          logging: false
        });
        const link = document.createElement('a');
        link.download = `receipt-${appointmentId}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
      } catch (error) {
        console.error('Error generating receipt image:', error);
        alert('Failed to download receipt as image');
      }
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-semibold text-gray-900 mb-1">Book Appointment</h1>
        <p className="text-sm text-gray-600">Schedule consultation with our expert doctors</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 py-4">
        {[
          { label: 'Select Doctor', n: 1 },
          { label: 'Date & Time', n: 2 },
          { label: 'Confirm', n: 3 },
        ].map((s, i, arr) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center size-8 rounded-full text-sm font-semibold transition-colors ${
                  step > s.n
                    ? 'bg-blue-600 text-white'
                    : step === s.n
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.n ? <Check className="size-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < arr.length - 1 && <ChevronRight className="size-4 text-gray-400" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Select Doctor ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by name, specialization, qualifications…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Error state */}
          {fetchError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <p className="text-sm text-red-700">{fetchError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLoading(true);
                  setFetchError(null);
                  api.get('/doctors/public')
                    .then(r => {
                      const list = r.data?.data || r.data?.doctors || (Array.isArray(r.data) ? r.data : []);
                      setDoctors(Array.isArray(list) ? list : []);
                    })
                    .catch(() => setFetchError('Still unable to load. Please check your connection.'))
                    .finally(() => setLoading(false));
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Doctor grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-lg bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 font-medium">No doctors found.</p>
                  {searchQuery && (
                    <p className="text-sm text-gray-400 mt-1">
                      Try a different search term.
                    </p>
                  )}
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border hover:border-blue-200"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Avatar className="size-20 rounded-lg shrink-0">
                          {doctor.profile_photo_url ? (
                            <img
                              src={doctor.profile_photo_url}
                              alt={doctor.full_name}
                              className="object-cover w-full h-full rounded-lg"
                            />
                          ) : (
                            <AvatarFallback className="rounded-lg bg-blue-100 text-blue-700 text-lg font-bold">
                              {doctor.full_name
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          )}
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 leading-tight truncate">
                              {doctor.full_name}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-100 shrink-0"
                            >
                              ₹{doctor.fees || 500}
                            </Badge>
                          </div>

                          <p className="text-sm font-semibold text-blue-600">
                            {doctor.specialization || 'General Physician'}
                          </p>

                          {doctor.qualifications && (
                            <p className="text-[11px] text-gray-500 font-medium">
                              {doctor.qualifications}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 pt-1">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                              <Award className="size-3.5 text-blue-500 shrink-0" />
                              <span>{doctor.experience_years || 0} yrs experience</span>
                            </div>

                            {doctor.languages && doctor.languages.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Video className="size-3.5 text-blue-500 shrink-0" />
                                <span className="line-clamp-1">
                                  {doctor.languages.join(', ')}
                                </span>
                              </div>
                            )}

                            {doctor.address && (
                              <div className="flex items-start gap-1.5 text-[11px] text-gray-500 col-span-full">
                                <MapPin className="size-3.5 text-blue-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{doctor.address}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-700">
                              <Building2 className="size-3.5 text-blue-600" />
                              <span className="line-clamp-1">
                                {doctor.clinic_name || 'Primary Clinic'}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDoctorSelect(doctor);
                              }}
                            >
                              Book
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

      {/* ── Step 2: Choose Date, Time & Type ── */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          {/* Selected doctor summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {selectedDoctor.full_name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{selectedDoctor.full_name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedDoctor.specialization || selectedDoctor.qualifications || 'General Physician'}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                  Change Doctor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appointment type */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={appointmentType}
                onValueChange={(v) => setAppointmentType(v as 'in-clinic' | 'video')}
              >
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

              {/* FIX: Show selected doctor's actual clinic info */}
              {appointmentType === 'in-clinic' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 text-gray-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDoctor.clinic_name || 'Primary Clinic'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedDoctor.clinic_address || selectedDoctor.address || 'Address not available'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {appointmentType === 'video' && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Video className="size-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Online Video Consultation</p>
                      <p className="text-xs text-blue-700">Join from anywhere using your device</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar + Time slots */}
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
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="size-5" />
                  Select Time Slot
                  {selectedDate && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                      {selectedDate.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-9 rounded-md bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((time) => {
                        const now = new Date();
                        const [timePart, modifier] = time.split(' ');
                        let [h, m] = timePart.split(':').map(Number);
                        if (modifier === 'PM' && h !== 12) h += 12;
                        if (modifier === 'AM' && h === 12) h = 0;

                        const slotDateTime = selectedDate ? new Date(selectedDate) : new Date();
                        slotDateTime.setHours(h, m, 0, 0);

                        // 1-hour buffer for same-day slots
                        const isPast = slotDateTime < new Date(now.getTime() + 60 * 60 * 1000);
                        const isBooked = bookedSlots.some(s => s?.trim() === time.trim());
                        const isAvailable = !isBooked && !isPast;

                        if (!isAvailable) return null;

                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                            className="w-full"
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>

                    {/* All slots unavailable message */}
                    {timeSlots.every(time => {
                      const now = new Date();
                      const [timePart, modifier] = time.split(' ');
                      let [h, m] = timePart.split(':').map(Number);
                      if (modifier === 'PM' && h !== 12) h += 12;
                      if (modifier === 'AM' && h === 12) h = 0;
                      const slotDateTime = selectedDate ? new Date(selectedDate) : new Date();
                      slotDateTime.setHours(h, m, 0, 0);
                      return (
                        bookedSlots.some(s => s?.trim() === time.trim()) ||
                        slotDateTime < new Date(now.getTime() + 60 * 60 * 1000)
                      );
                    }) && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg text-center">
                        <p className="text-sm text-orange-600 font-medium">
                          No available slots for this date. Please choose another day.
                        </p>
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

      {/* ── Step 3: Confirm Booking ── */}
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
                  <p className="text-sm text-gray-600">
                    {selectedDoctor.specialization || selectedDoctor.qualifications || 'General Physician'}
                  </p>
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
                      year: 'numeric',
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

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-medium text-gray-900">₹{selectedDoctor.fees || 500}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">₹50</span>
                </div>
                <div className="flex justify-between items-center text-base pt-2 border-t font-semibold">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">₹{(selectedDoctor.fees || 500) + 50}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit (Optional)</Label>
                <Textarea
                  placeholder="Describe your symptoms or reason for consultation…"
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
              {bookingLoading
                ? 'Processing…'
                : `Confirm & Pay ₹${(selectedDoctor.fees || 500) + 50}`}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 4: Success ── */}
      {step === 4 && selectedDoctor && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-8 text-center">
              <div className="size-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="size-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Appointment Booked Successfully!
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Your appointment has been confirmed. You will receive a confirmation shortly.
              </p>

              {/* Receipt */}
              <div
                ref={receiptRef}
                className="bg-white rounded-lg p-6 mb-6 text-left border border-green-100 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <CalendarIcon className="size-4 text-white" />
                    </div>
                    <span className="font-bold text-gray-900">E Clinic Receipt</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    Confirmed
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Appointment ID</p>
                    {/* FIX: appointmentId is stable state, not re-evaluated Math.random() */}
                    <p className="font-mono font-semibold text-gray-900 text-sm">{appointmentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Doctor</p>
                    <p className="font-medium text-gray-900">{selectedDoctor.full_name}</p>
                    <p className="text-xs text-gray-500">{selectedDoctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-900">
                      {selectedDate?.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      at {selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <Badge className={appointmentType === 'video' ? 'bg-blue-600' : 'bg-green-600'}>
                      {appointmentType === 'video' ? 'Video Call' : 'In-Clinic'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Patient</p>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount Paid</p>
                    <p className="font-semibold text-gray-900">
                      ₹{(selectedDoctor.fees || 500) + 50}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
                  onClick={downloadReceiptAsImage}
                >
                  Download Receipt (JPG)
                </Button>
                {/* FIX: full state reset, not just setStep(1) */}
                <Button className="flex-1" onClick={resetBooking}>
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
