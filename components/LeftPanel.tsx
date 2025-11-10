import React, { useState, useEffect } from 'react';
import { DoctorInfo, UIStrings } from '../services';
import * as services from '../services';

// Utility: Calculate distance (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Local mock dataset (you can add more)
const localDoctors = [
  { name: 'Dr. Aarav Sharma', phone: '+91 98765 43210', lat: 28.6139, lon: 77.2090, types: 'Neurosurgeon, Specialist' },
  { name: 'Dr. Meera Kapoor', phone: '+91 91234 56789', lat: 28.6210, lon: 77.2150, types: 'Physician' },
  { name: 'Dr. Rohan Gupta', phone: '+91 99888 77665', lat: 28.6095, lon: 77.2021, types: 'Orthopedic Surgeon' },
];

const localHospitals = [
  { name: 'Apollo Hospital', lat: 28.6221, lon: 77.2085 },
  { name: 'Fortis Healthcare', lat: 28.6152, lon: 77.2113 },
  { name: 'Max Super Specialty', lat: 28.6189, lon: 77.2040 },
];

// ------------------ DoctorCard ------------------
const DoctorCard: React.FC<{ doctor: DoctorInfo; uiStrings: UIStrings }> = ({ doctor, uiStrings }) => {
  const initials = doctor.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const handleWhatsApp = () => {
    if (!doctor.phone) return alert(uiStrings.phoneNotAvailable);
    const phoneNumber = doctor.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hello ${doctor.name}, I found your clinic via Neuro Glove Assistance. I need assistance.`);
    const waUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="mt-2 p-3 rounded-xl bg-gradient-to-b from-teal-50 to-emerald-50 border border-teal-100/50 flex gap-3 items-center animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-teal-100 to-teal-200 flex-shrink-0 flex items-center justify-center font-extrabold text-teal-800 text-lg">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-teal-900 truncate" title={doctor.name}>{doctor.name}</div>
        <div className="text-gray-500 text-sm mt-1">{doctor.types}</div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
          <a href={doctor.phone ? `tel:${doctor.phone.replace(/\s+/g, '')}` : '#'} className="text-teal-700 font-bold text-sm hover:underline">
            {doctor.phone || uiStrings.phoneNotAvailable}
          </a>
          <div className="flex items-center gap-2">
            <div className="text-teal-800 font-bold min-w-[60px] text-right text-sm">{services.formatDistance(doctor.distKm)}</div>
            <button
              onClick={() => services.openMapsDirections(doctor.lat, doctor.lon, doctor.name)}
              className="text-teal-700 font-bold text-xs px-2.5 py-1.5 rounded-md bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
            >
              {uiStrings.directions}
            </button>
            <button
              onClick={handleWhatsApp}
              className="text-green-700 font-bold text-xs px-2.5 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
            >
              {uiStrings.whatsapp}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------ Helplines ------------------
const Helplines: React.FC<{ uiStrings: UIStrings }> = ({ uiStrings }) => {
  const HelplineRow: React.FC<{ label: string; number: string; isPrimary?: boolean }> = ({ label, number, isPrimary }) => (
    <div className={`flex justify-between items-center p-2.5 rounded-lg ${isPrimary ? 'bg-gradient-to-r from-teal-50/50 to-emerald-50/50' : 'bg-gray-100/50'}`}>
      <div className="text-gray-600 text-sm">{label}</div>
      <a href={`tel:${number}`} className="text-teal-700 font-bold hover:underline">{number}</a>
    </div>
  );
  return (
    <div className="mt-2">
      <h4 className="font-bold mb-2">{uiStrings.helplinesTitle}</h4>
      <div className="space-y-2">
        <HelplineRow label="Hospital" number="0120 662 9999" isPrimary />
        <HelplineRow label={uiStrings.police} number="100" />
        <HelplineRow label={uiStrings.ambulance} number="102" />
      </div>
    </div>
  );
};

// ------------------ Brand Header ------------------
const BrandHeader: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[12px] bg-gradient-to-b from-[#19c7b3] to-[#0f766e]">
      <span className="text-white font-extrabold text-[17px] leading-none">NG</span>
    </div>
    <div>
      <h1 className="text-lg font-semibold leading-tight">Neuro Glove</h1>
      <div className="text-gray-500 text-sm">Assistance</div>
    </div>
  </div>
);

// ------------------ Main Component ------------------
const LeftPanel: React.FC<{ onDoctorFound: (doctor: DoctorInfo | null) => void; doctor: DoctorInfo | null; appendLog: (text: string, direction: 'in' | 'out') => void; uiStrings: UIStrings; }> =
({ onDoctorFound, doctor, appendLog, uiStrings }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState(() => localStorage.getItem('neuroglove-emergency-contact') || '112');

  useEffect(() => {
    localStorage.setItem('neuroglove-emergency-contact', emergencyNumber);
  }, [emergencyNumber]);

  // ✅ Nearby Doctors
  const handleSearchDoctors = async () => {
    setIsLoading(true);
    appendLog('Finding nearby doctors...', 'out');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const { latitude, longitude } = position.coords;

      const doctorsWithDist = localDoctors.map(d => ({
        ...d,
        distKm: getDistanceKm(latitude, longitude, d.lat, d.lon),
      }));

      const nearest = doctorsWithDist.sort((a, b) => a.distKm - b.distKm)[0];
      onDoctorFound(nearest);
      appendLog(`Nearest doctor: ${nearest.name} (${services.formatDistance(nearest.distKm)})`, 'in');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendLog(`Error finding doctors: ${msg}`, 'in');
      alert(`Error finding doctors: ${msg}`);
      onDoctorFound(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Nearby Hospitals
  const handleSearchHospitals = async () => {
    appendLog('Finding nearby hospitals...', 'out');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );

      const { latitude, longitude } = position.coords;
      const hospitalsWithDist = localHospitals.map(h => ({
        ...h,
        distKm: getDistanceKm(latitude, longitude, h.lat, h.lon),
      }));

      const nearest = hospitalsWithDist.sort((a, b) => a.distKm - b.distKm)[0];
      appendLog(`Nearest hospital: ${nearest.name} (${services.formatDistance(nearest.distKm)})`, 'in');
      services.openMapsDirections(nearest.lat, nearest.lon, nearest.name);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      appendLog(`Location error: ${msg}`, 'in');
      alert(`Location error: ${msg}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg flex flex-col gap-4">
      <BrandHeader />
      <div className="border-2 border-red-200 bg-red-50/50 rounded-xl p-3 space-y-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute inset-y-0 left-0 pl-3 h-full w-5 text-red-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
          <input
            type="tel"
            value={emergencyNumber}
            onChange={(e) => setEmergencyNumber(e.target.value)}
            placeholder="Emergency Number"
            className="w-full pl-10 pr-3 py-2.5 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold text-red-900 bg-white/60"
          />
        </div>
        <a
          href={emergencyNumber ? `tel:${emergencyNumber}` : '#'}
          onClick={(e) => {
            if (!emergencyNumber) {
              e.preventDefault();
              alert('Please set an emergency number.');
            }
          }}
          className={`w-full bg-gradient-to-b from-red-600 to-red-700 text-white px-3 py-3 rounded-lg font-bold hover:from-red-700 transition-all shadow-lg flex items-center justify-center gap-2 text-lg ${!emergencyNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="Emergency Call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          EMERGENCY CALL
        </a>
      </div>

      <div className="space-y-2">
        <div>
          <h3 className="font-bold text-lg">{uiStrings.findTitle}</h3>
          <p className="text-sm text-gray-500">{uiStrings.findDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            className="flex-1 bg-teal-700 text-white px-3 py-2.5 rounded-lg font-bold hover:bg-teal-800 transition-colors disabled:bg-teal-400"
            onClick={handleSearchDoctors}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : uiStrings.nearbyDoctors}
          </button>
          <button
            className="flex-1 bg-transparent border border-gray-200 text-teal-700 px-3 py-2.5 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            onClick={handleSearchHospitals}
          >
            {uiStrings.nearbyHospitals}
          </button>
        </div>
      </div>

      {doctor && <DoctorCard doctor={doctor} uiStrings={uiStrings} />}
      <Helplines uiStrings={uiStrings} />
    </div>
  );
};

export default LeftPanel;
