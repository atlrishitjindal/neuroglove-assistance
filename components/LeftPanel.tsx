import React, { useState, useEffect } from "react";
import { DoctorInfo, UIStrings } from "../services";
import * as services from "../services";

// Distance display helper
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
              onClick={() =>
                services.openMapsDirections(
                  doctor.lat,
                  doctor.lon,
                  doctor.name
                )
              }
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

  // ✅ Fake nearby doctor near Cambridge School, Indirapuram
  const handleSearchDoctors = async () => {
    setIsLoading(true);
    appendLog("Finding nearby doctors...", "out");

    setTimeout(() => {
      const fakeDoctor: DoctorInfo = {
        name: "Dr. Aarav Sharm
