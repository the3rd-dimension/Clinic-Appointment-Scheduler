"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, Search, ShieldCheck, Stethoscope } from "lucide-react";

type Doctor = { 
  id: string; 
  name: string; 
  specialization: string; 
  initials?: string; 
  accent?: string; 
  nextAvailable?: string 
};

export default function Home() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialization, setSpecialization] = useState("All specialties");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("02:30 PM");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch live doctors from your API route on page load
  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((data: Doctor[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((doc) => ({
            ...doc,
            initials: doc.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
            accent: "bg-[#e5f0ea] text-[#27604b]",
            nextAvailable: "Available",
          }));
          setDoctors(formatted);
          setSelectedDoctor(formatted[0]);
        }
      })
      .catch((err) => console.error("Failed to load doctors:", err));
  }, []);

  const slots = ["08:30 AM", "09:15 AM", "10:00 AM", "11:30 AM", "01:00 PM", "02:30 PM", "03:15 PM", "04:00 PM"];

  const filteredDoctors = useMemo(() => 
    specialization === "All specialties" 
      ? doctors 
      : doctors.filter((doctor) => doctor.specialization === specialization), 
    [specialization, doctors]
  );

  async function bookAppointment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); 
    setStatus(null);
    if (!selectedDoctor) return;
    
    const startTime = new Date(`2026-09-14 ${selectedSlot}`); 
    const endTime = new Date(startTime.getTime() + 45 * 60 * 1000);
    
    const response = await fetch("/api/appointments", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ doctorId: selectedDoctor.id, patientName, patientEmail, startTime, endTime }) 
    });
    
    const result = await response.json(); 
    setStatus({ 
      type: response.ok ? "success" : "error", 
      message: response.ok ? `Appointment confirmed with ${selectedDoctor.name}.` : result.error 
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f9f7] text-[#20322a]">
      <header className="border-b border-[#dce6df] bg-[#fbfdfb]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#27604b] text-white">
              <Stethoscope size={19} />
            </div>
            <span className="font-semibold tracking-tight">northstar<span className="text-[#72a889]">.</span>health</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#66766d]">
            <span className="hidden sm:inline">Patient portal</span>
            <div className="size-8 rounded-full bg-[#d5e4d9] text-center pt-1.5 text-xs font-semibold text-[#27604b]">JD</div>
          </div>
        </div>
      </header>
      
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-10 lg:pt-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#579172]">Your care, on your time</p>
          <h1 className="font-serif text-5xl leading-[1.03] tracking-[-0.04em] text-[#1d3b2d] sm:text-6xl">
            Make space for<br /><em className="font-normal text-[#579172]">feeling better.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#68776f]">Find a trusted specialist and reserve a time that works for you. Your next appointment is a few simple steps away.</p>
        </div>
      </section>
      
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="rounded-2xl border border-[#dce6df] bg-white p-5 shadow-[0_16px_50px_rgba(38,80,60,0.06)] sm:p-7">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 01</p>
              <h2 className="mt-1 text-xl font-semibold">Choose your specialist</h2>
            </div>
            <span className="rounded-full bg-[#f0f6f1] px-3 py-1 text-xs font-medium text-[#579172]">
              {doctors.length} doctors available
            </span>
          </div>
          
          <label className="relative block">
            <Search className="absolute left-3.5 top-3.5 text-[#8b9a91]" size={18} />
            <select 
              value={specialization} 
              onChange={(event) => setSpecialization(event.target.value)} 
              className="w-full appearance-none rounded-xl border border-[#dce6df] bg-[#fbfdfb] py-3 pl-11 pr-10 text-sm outline-none focus:border-[#579172]"
            >
              <option>All specialties</option>
              <option>Cardiology</option>
              <option>General medicine</option>
              <option>Dermatology</option>
              <option>Computer Health</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-3.5 text-[#8b9a91]" size={18} />
          </label>
          
          <div className="mt-5 space-y-3">
            {filteredDoctors.map((doctor) => (
              <button 
                type="button" 
                key={doctor.id} 
                onClick={() => setSelectedDoctor(doctor)} 
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selectedDoctor?.id === doctor.id ? "border-[#579172] bg-[#f3f8f4]" : "border-[#e6ece8] hover:border-[#b8cfc0]"}`}
              >
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${doctor.accent}`}>
                  {doctor.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{doctor.name}</p>
                  <p className="mt-0.5 text-sm text-[#7c8b82]">{doctor.specialization}</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-xs text-[#91a097]">Next available</p>
                  <p className="mt-0.5 text-sm font-medium text-[#4b6758]">{doctor.nextAvailable}</p>
                </div>
                <div className={`flex size-5 items-center justify-center rounded-full border ${selectedDoctor?.id === doctor.id ? "border-[#579172] bg-[#579172] text-white" : "border-[#c8d6cc]"}`}>
                  {selectedDoctor?.id === doctor.id && <Check size={13} />}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="rounded-2xl border border-[#dce6df] bg-[#edf5ef] p-5 sm:p-7">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 02</p>
            <h2 className="mt-1 text-xl font-semibold">Find a time</h2>
          </div>
          
          <div className="flex items-center justify-between rounded-xl border border-[#d5e3d8] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="text-[#579172]" size={18} />
              <div>
                <p className="text-sm font-medium">Monday, September 14</p>
                <p className="text-xs text-[#84948a]">45 minute consultation</p>
              </div>
            </div>
            <ArrowRight className="text-[#9caf9f]" size={17} />
          </div>
          
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {slots.map((slot) => (
              <button 
                type="button" 
                key={slot} 
                onClick={() => setSelectedSlot(slot)} 
                className={`rounded-lg border px-2 py-3 text-sm transition ${selectedSlot === slot ? "border-[#27604b] bg-[#27604b] text-white" : "border-[#d5e3d8] bg-white text-[#4d6959] hover:border-[#579172]"}`}
              >
                <Clock3 className="mr-1 inline" size={13} />{slot}
              </button>
            ))}
          </div>
          
          <div className="mt-7 border-t border-[#d5e3d8] pt-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#72a889]">Step 03 · Your details</p>
            <form onSubmit={bookAppointment} className="space-y-3">
              <input 
                required 
                minLength={2} 
                value={patientName} 
                onChange={(event) => setPatientName(event.target.value)} 
                placeholder="Full name" 
                className="w-full rounded-lg border border-[#d5e3d8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9aa9a0] focus:border-[#579172]" 
              />
              <input 
                required 
                type="email" 
                value={patientEmail} 
                onChange={(event) => setPatientEmail(event.target.value)} 
                placeholder="Email address" 
                className="w-full rounded-lg border border-[#d5e3d8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#9aa9a0] focus:border-[#579172]" 
              />
              <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#27604b] py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4939]">
                Confirm appointment <ArrowRight size={16} />
              </button>
            </form>
            
            {status && (
              <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${status.type === "success" ? "border-[#b9dcc4] bg-[#eff9f1] text-[#27604b]" : "border-[#ebc5b7] bg-[#fff4ef] text-[#a14f34]"}`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <footer className="border-t border-[#dce6df] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-[#84948a] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#579172]" /> Your health information is protected and private.
          </div>
          <span>© 2026 Northstar Health</span>
        </div>
      </footer>
    </main>
  );
}