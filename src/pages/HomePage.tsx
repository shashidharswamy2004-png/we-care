import React, { useState } from 'react';
import { NavTab } from '../components/Header';
import { DEPARTMENTS, DOCTORS, HOSPITAL_METRICS, TESTIMONIALS, HEALTH_ARTICLES, ACCREDITATIONS } from '../data/hospitalData';
import { Doctor, Department } from '../types/hospital';
import {
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Award,
  Stethoscope,
  Star,
  CheckCircle,
  PhoneCall,
  Activity,
  HeartPulse,
  Brain,
  Bone,
  Baby,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenBooking: () => void;
  onSelectDepartment: (deptId: string) => void;
  onSelectDoctor: (doctor: Doctor) => void;
  onQuickBook: (deptId: string, doctorId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectTab,
  onOpenBooking,
  onSelectDepartment,
  onSelectDoctor,
  onQuickBook
}) => {
  // Quick bar state
  const [quickDeptId, setQuickDeptId] = useState(DEPARTMENTS[0].id);
  const quickDoctors = DOCTORS.filter((d) => d.departmentId === quickDeptId);
  const [quickDoctorId, setQuickDoctorId] = useState(quickDoctors[0]?.id || DOCTORS[0].id);

  const handleQuickDeptChange = (deptId: string) => {
    setQuickDeptId(deptId);
    const docs = DOCTORS.filter((d) => d.departmentId === deptId);
    if (docs.length > 0) {
      setQuickDoctorId(docs[0].id);
    }
  };

  const getDeptIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-teal-700" />;
      case 'Brain': return <Brain className="w-5 h-5 text-teal-700" />;
      case 'Bone': return <Bone className="w-5 h-5 text-teal-700" />;
      case 'Baby': return <Baby className="w-5 h-5 text-teal-700" />;
      case 'Activity': return <Activity className="w-5 h-5 text-teal-700" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-teal-700" />;
      default: return <Stethoscope className="w-5 h-5 text-teal-700" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/hero_wecare_hospital_1791639903974.jpg"
            alt="WeCare Hospital Modern Medical Pavilion"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>JCI Accredited & NABH Certified Medical Center</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              World-Class Clinical Precision. Compassionate Patient Care.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              At WeCare Hospital, over 350 world-renowned physicians, cutting-edge robotic surgical suites, and dedicated emergency trauma units unite to put your healing first.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onOpenBooking}
                className="px-6 py-3.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 active:bg-teal-700 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>
              <button
                onClick={() => onSelectTab('departments')}
                className="px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Explore Departments</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Booking Strip below hero content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-6 sm:-mt-10">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-5 lg:p-6 text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-700" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Quick Consultation Finder
                </h3>
              </div>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Instant confirmation · No booking fees
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  1. Medical Department
                </label>
                <select
                  value={quickDeptId}
                  onChange={(e) => handleQuickDeptChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  2. Select Specialist
                </label>
                <select
                  value={quickDoctorId}
                  onChange={(e) => setQuickDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  {quickDoctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.availableDays[0] || 'Available'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  3. Emergency Contact
                </label>
                <a
                  href="tel:8009322273"
                  className="w-full bg-rose-50 border border-rose-200 text-rose-800 rounded-lg px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-rose-100 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                  <span>24/7 Helpline: (800) 932-CARE</span>
                </a>
              </div>

              <div>
                <button
                  onClick={() => onQuickBook(quickDeptId, quickDoctorId)}
                  className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Check Slots & Book</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hospital Key Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {HOSPITAL_METRICS.map((metric, i) => (
            <div key={i} className="text-center sm:text-left border-l-0 sm:border-l first:border-l-0 border-slate-200 pl-0 sm:pl-6 first:pl-0">
              <span className="block text-3xl sm:text-4xl font-extrabold text-teal-800 tracking-tight tabular-nums">
                {metric.value}
              </span>
              <span className="block text-xs font-medium text-slate-600 mt-1">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Clinical Departments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
              Clinical Specializations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Comprehensive Medical Departments
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mt-1">
              Each department is led by distinguished medical chairs and supported by dedicated multi-disciplinary teams and specialized diagnostic labs.
            </p>
          </div>
          <button
            onClick={() => onSelectTab('departments')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>View All 8 Departments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEPARTMENTS.slice(0, 6).map((dept) => {
            const doctorsCount = DOCTORS.filter((d) => d.departmentId === dept.id).length;
            return (
              <div
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all p-6 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      {doctorsCount} Specialists
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {dept.name}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {dept.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Key Interventions:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {dept.keyServices.slice(0, 2).map((srv, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-teal-600 shrink-0" />
                          <span className="truncate">{srv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectTab('departments');
                      onSelectDepartment(dept.id);
                    }}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    Department Overview
                  </button>
                  <button
                    onClick={() => onQuickBook(dept.id, dept.doctorIds[0])}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Book Doctor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Doctors Showcase */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Medical Excellence
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Meet Our Senior Physicians
              </h2>
              <p className="text-sm text-slate-600 max-w-xl mt-1">
                Board-certified specialists with decades of experience from top academic institutions worldwide.
              </p>
            </div>
            <button
              onClick={() => onSelectTab('doctors')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View All Doctors ({DOCTORS.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DOCTORS.slice(0, 4).map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-lg shadow-inner shrink-0">
                      {doctor.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {doctor.name}
                      </h4>
                      <p className="text-xs text-teal-700 font-medium line-clamp-1">
                        {doctor.title}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span className="tabular-nums text-slate-700">{doctor.rating.toFixed(2)}</span>
                        <span className="text-slate-400 font-normal">({doctor.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doctor.about}
                  </p>

                  <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                    <p>
                      <strong className="text-slate-700">Experience:</strong> {doctor.experienceYears} Years
                    </p>
                    <p>
                      <strong className="text-slate-700">Days:</strong> {doctor.availableDays.slice(0, 3).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectDoctor(doctor)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onQuickBook(doctor.departmentId, doctor.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Book Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Stories & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Real Patient Journeys
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Stories of Healing and Restored Hope
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mt-1">
            Verified patient testimonials across our cardiac, joint replacement, and neonatal care teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <blockquote className="text-xs text-slate-700 leading-relaxed italic">
                  "{t.quote}"
                </blockquote>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900">{t.patientName}, {t.age} yrs</h4>
                <p className="text-[11px] text-teal-700 font-medium">{t.outcome}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Treated by {t.doctorTreated} · {t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities & Clinical Edge Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl overflow-hidden text-white border border-slate-800 grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                Technology & Innovation
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                State-of-the-Art Hybrid Operating Theatres & 24/7 Diagnostics
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                WeCare Hospital features 18 ultra-clean laminar flow operating rooms, dual-source 512-slice CT scanners, 3T silent MRI imaging, and integrated robotic surgical consoles that reduce patient recovery times by over 40%.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Zero-delay emergency triage with dedicated stroke & STEMI protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Private patient suites with HEPA filtration and family recovery zones</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-teal-400" />
                <span>Fully digital EHR integrated with convenient patient appointment tracking</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onSelectTab('about')}
                className="px-5 py-2.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Discover Our Hospital Campus & Facilities
              </button>
            </div>
          </div>

          <div className="relative min-h-[300px] lg:min-h-full">
            <img
              src="/src/assets/images/facility_advanced_care_1791639940086.jpg"
              alt="Advanced Surgical Suite at WeCare Hospital"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Health Articles & Medical Insights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block mb-1">
            Doctor-Authored Guides
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Preventive Health & Clinical Insights
          </h2>
          <p className="text-sm text-slate-600 max-w-xl mt-1">
            Educational wellness advice written by WeCare Hospital medical faculty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HEALTH_ARTICLES.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-teal-200 transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-teal-700">{art.category}</span>
                  <span>{art.readTime}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {art.summary}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <p className="font-medium text-slate-700">{art.author}</p>
                <p>{art.date}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
