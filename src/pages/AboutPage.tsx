import React from 'react';
import { NavTab } from '../components/Header';
import { ACCREDITATIONS } from '../data/hospitalData';
import {
  ShieldCheck,
  Heart,
  Award,
  Users,
  Compass,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Microscope,
  Stethoscope
} from 'lucide-react';

interface AboutPageProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenBooking: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onSelectTab, onOpenBooking }) => {
  const leadership = [
    {
      name: 'Dr. Arthur Vance, MD, FACC',
      role: 'Chief Medical Officer & Director of Heart Institute',
      bio: 'Board-certified interventional cardiologist with 24 years leading multi-center clinical trials and academic health governance.'
    },
    {
      name: 'Dr. Elena Rostova, MD, PhD',
      role: 'Director of Surgical Services & Neurosurgery Chair',
      bio: 'Pioneered minimally invasive skull base procedures and oversees surgical quality across all 18 operating theatres.'
    },
    {
      name: 'Sarah Jenkins, RN, MSN, NEA-BC',
      role: 'Chief Nursing Officer & Patient Experience Lead',
      bio: 'Champion of our 1:3 intensive care nurse-to-patient ratio that achieved the Magnet Nursing Excellence distinction.'
    },
    {
      name: 'Marcus Sterling, MBA, FACHE',
      role: 'Chief Executive Officer',
      bio: 'Dedicated to patient safety, health accessibility, and expanding outpatient regional specialty care hubs.'
    }
  ];

  const values = [
    {
      title: 'Uncompromising Compassion',
      description: 'We treat every patient and family member as our own kin, creating an atmosphere of dignity, psychological safety, and warmth.'
    },
    {
      title: 'Evidence-Based Precision',
      description: 'Every medical decision is grounded in verified clinical research, peer-reviewed protocols, and multi-disciplinary tumor boards.'
    },
    {
      title: 'Surgical & Diagnostic Innovation',
      description: 'Investing continuously in robotic-assisted systems, AI-supported radiology diagnostics, and motion-sparing orthopedics.'
    },
    {
      title: 'Radical Transparency',
      description: 'Clear upfront communication about care pathways, expected recovery benchmarks, and transparent healthcare finances.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Header */}
      <section className="bg-slate-900 text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
              About WeCare Hospital
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              A Legacy of Excellence, Empathy, and Healing
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Founded over 35 years ago, WeCare Hospital has evolved from a local surgical hospital into an internationally accredited 600-bed quaternary medical sanctuary trusted by patients worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Main Campus Image & Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md">
            <img
              src="/src/assets/images/about_hospital_campus_1791639923898.jpg"
              alt="WeCare Hospital Interior Campus Atrium"
              referrerPolicy="no-referrer"
              className="w-full h-[400px] lg:h-[480px] object-cover"
            />
          </div>

          <div className="space-y-6">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
              Our Journey & Purpose
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Transforming Healthcare into a Human-Centered Sanctuary
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              At WeCare Hospital, healing begins the moment you step through our doors. We believe world-class medicine and human empathy are not mutually exclusive—they are inextricably linked.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              From our architectural layout designed with natural daylight to soothe stress, to our integrated electronic records that connect all your physicians in real-time, every detail has been intentionally engineered around the patient journey.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-2xl font-bold text-teal-800 tabular-nums">600+</span>
                <span className="block text-xs font-medium text-slate-600 mt-0.5">Inpatient & ICU Beds</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200">
                <span className="text-2xl font-bold text-teal-800 tabular-nums">35+</span>
                <span className="block text-xs font-medium text-slate-600 mt-0.5">Years of Service</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Core Values */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Guiding Principles
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Our Core Clinical Values
            </h2>
            <p className="text-sm text-slate-600">
              The fundamental convictions that guide our physicians, nurses, researchers, and care coordinators every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center mb-4">
                    0{i + 1}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditations & Certifications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Gold Standard Verification
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Accreditations & International Honors
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mt-1">
            Audited annually by independent medical accrediting bodies for uncompromising patient safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACCREDITATIONS.map((acc, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <ShieldCheck className="w-8 h-8 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{acc.name}</h3>
                <span className="inline-block text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {acc.badge}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{acc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership & Medical Governance */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Clinical Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Executive Medical Leadership
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mt-1">
            Stewards of patient safety, clinical ethics, and continuous scientific advancement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadership.map((lead, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-teal-800 font-bold flex items-center justify-center text-sm mb-4">
                  {lead.name.split(' ')[1]?.[0] || 'D'}{lead.name.split(' ')[2]?.[0] || 'L'}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{lead.name}</h3>
                <p className="text-xs text-teal-700 font-medium mb-2.5 mt-0.5">{lead.role}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{lead.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-teal-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Experience Care Rooted in Empathy</h3>
            <p className="text-sm text-teal-100">
              Schedule your consultation with one of our specialized medical teams or visit our campus.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenBooking}
              className="px-6 py-3 text-xs font-semibold text-teal-900 bg-white hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Book an Appointment
            </button>
            <button
              onClick={() => onSelectTab('doctors')}
              className="px-5 py-3 text-xs font-semibold text-white bg-teal-900/60 hover:bg-teal-900 border border-teal-700 rounded-xl transition-colors cursor-pointer"
            >
              View All Doctors
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
