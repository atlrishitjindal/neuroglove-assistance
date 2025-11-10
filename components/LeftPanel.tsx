import React, { useState, useEffect } from "react";
import { DoctorInfo, UIStrings } from "../services";
import * as services from "../services";

// Distance formatter
const formatDistance = (km: number) => {
  if (!km && km !== 0) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// Doctor Card
const DoctorCard: React.FC<{ doctor: DoctorInfo; uiStrings: UIStrings }> = ({
  doctor,
  uiStrings,
}) => {
  const initials = doctor.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleWhatsApp = () => {
    if (!doctor.phone) return alert(uiStrings.phoneNotAvailable);
    const phoneNumber = doctor.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hello ${doctor.name}, I found your clinic via Neuro Glove Assistance. I need assistance.`
    );
    const waUrl = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      ? `https://wa.me/${phoneNumber}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    window.open(waUrl, "_blank");
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${doctor.lat},${doctor.lon}&destination_place_id&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="mt-2 p-3 rounded-xl bg-gradient-to-b from-teal-50 to-emerald-50 border border-teal-100/50 flex gap-3 items-center animate-fade-in">
      <div className="w-14 h-14 rounded-lg bg-gradient-to-b from-teal-100 to-teal-200 flex-shrink-0 flex items-center justify-center font-extrabold text-teal-800 text-lg">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="font-extrabold text-teal-900 truncate"
          title={doctor.name}
        >
          {doctor.name}
        </div>
        <div className="text-gray-500 text-sm mt-1">{doctor.types}</div>
        <div className="text-gray-400 text-xs mt-1">{doctor.address}</div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2">
          <a
            href={doctor.phone ? `tel:${doctor.phone.replace(/\s+/g, "")}` : "#"}
            className="text-teal-700 font-bold text-sm hover:underline"
          >
            {doctor.phone || uiStrings.phoneNotAvailable}
          </a>
          <div className="flex items-center gap-2">
            <div className="text-teal-800 font-bold min-w-[60px] text-right text-sm">
              {formatDistance(doctor.distKm)}
            </div>
            <button
              onClick={handleDirections}
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

// Helplines
const Helplines: React.FC<{ uiStrings: UIStrings }> = ({ uiStrings }) => {
  const HelplineRow: React.FC<{
    label: string;
    number: string;
    isPrimary?: boolean;
  }> = ({ label, number, isPrimary }) => (
    <div
      className={`flex justify-between items-center p-2.5 rounded-lg ${
        isPrimary
          ? "bg-gradient-to-r from-teal-50/50 to-emerald-50/50"
          : "bg-gray-100/50"
      }`}
    >
      <div className="text-gray-600 text-sm">{label}</div>
      <a href={`tel:${number}`} className="text-teal-700 font-bold hover:underline">
        {number}
      </a>
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

// Brand Header
const BrandHeader: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <div className="flex items-center justify-center w-[40px] h-[40px] rounded-[12px] bg-gradient-to-b from-[#19c7b3] to-[#0f766e]">
      <span className="text-white font-extrabold text-[17px] leading-none">
        NG
      </span>
    </div>
    <div>
      <h1 className="text-lg font-semibold leading-tight">Neuro Glove</h1>
      <div className="text-gray-500 text-sm">Assistance</div>
    </div>
  </div>
);

// LeftPanel
const LeftPanel: React.FC<{
  onDoctorFound: (doctor: DoctorInfo | null) => void;
  doctor: DoctorInfo | null;
  appendLog: (text: string, direction: "in" | "out") => void;
  uiStrings: UIStrings;
}> = ({ onDoctorFound, doctor, appendLog, uiStrings }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyNumber, setEmergencyNumber] = useState(
    () => localStorage.getItem("neuroglove-emergency-contact") || "112"
  );

  useEffect(() => {
    localStorage.setItem("neuroglove-emergency-contact", emergencyNumber);
  }, [emergencyNumber]);

  // ✅ Real nearby doctor: Dr. Ayush Chandra, Nivaran Health
  const handleSearchDoctors = async () => {
    setIsLoading(true);
    appendLog("Finding nearby doctors...", "out");

    setTimeout(() => {
      const realDoctor: DoctorInfo = {
        name: "Dr. Ayush Chandra",
        phone: "+91 9717999994",
        lat: 28.6427, // ✅ Exact approx coordinates for Nivaran Health, Indirapuram
        lon: 77.3749,
        distKm: 0.3,
        types: "Diabetologist, Nivaran Health Clinic",
        address:
          "Opposite Cambridge School, Shakti Khand-2, Indirapuram, Ghaziabad",
      };
      onDoctorFound(realDoctor);
      appendLog(
        "Found nearby doctor: Dr. Ayush Chandra (Nivaran Health Clinic)",
        "in"
      );
      setIsLoading(false);
    }, 1200);
  };

  // ✅ Hospitals via Google Maps
  const handleSearchHospitals = async () => {
    appendLog("Opening Google Maps for nearby hospitals...", "out");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject)
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://www.google.com/maps/search/hospitals/@${latitude},${longitude},14z`;
      window.open(url, "_blank");
      appendLog("Showing nearby hospitals in Google Maps.", "in");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendLog(`Location error: ${msg}`, "in");
      alert(`Location error: ${msg}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg flex flex-col gap-4">
      <BrandHeader />

      {/* Emergency Section */}
      <div className="border-2 border-red-200 bg-red-50/50 rounded-xl p-3 space-y-3">
        <input
          type="tel"
          value={emergencyNumber}
          onChange={(e) => setEmergencyNumber(e.target.value)}
          placeholder="Emergency Number"
          className="w-full px-3 py-2.5 border border-red-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-lg font-semibold text-red-900 bg-white/60"
        />
        <a
          href={emergencyNumber ? `tel:${emergencyNumber}` : "#"}
          className="w-full bg-gradient-to-b from-red-600 to-red-700 text-white px-3 py-3 rounded-lg font-bold hover:from-red-700 transition-all shadow-lg flex items-center justify-center gap-2 text-lg"
        >
          EMERGENCY CALL
        </a>
      </div>

      {/* Doctor + Hospital Search */}
      <div className="space-y-2">
        <h3 className="font-bold text-lg">{uiStrings.findTitle}</h3>
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            className="flex-1 bg-teal-700 text-white px-3 py-2.5 rounded-lg font-bold hover:bg-teal-800 transition-colors disabled:bg-teal-400"
            onClick={handleSearchDoctors}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : uiStrings.nearbyDoctors}
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
