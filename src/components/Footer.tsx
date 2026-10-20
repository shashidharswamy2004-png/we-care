import React from 'react';
import { NavTab } from './Header';
import { Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';
import { DEPARTMENTS } from '../data/hospitalData';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
  onOpenBooking: () => void;
  onSelectDepartment: (deptId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectTab,
  onOpenBooking,
  onSelectDepartment
}) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Banner inside Footer: Immediate Need Strip */}
      <div className="border-b border-slate-800 bg-slate-950/70 py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-600/20 text-teal-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">Need to consult a doctor today?</h4>
              <p className="text-xs text-slate-400">Same-day outpatient slots and urgent video visits available.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Book an Appointment
            </button>
            <a
              href="tel:8009322273"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(800) 932-CARE</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-lg">
                +
              </div>
              <span className="text-xl font-bold tracking-tight text-white">WeCare Hospital</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              WeCare Hospital is a leading multidisciplinary healthcare institution committed to clinical precision, compassionate care, and medical innovation across over 20 sub-specialties.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>742 Health Sciences Blvd, Medical District, Metro City, MC 90210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Helpline: +1 (800) 932-2273 · Triage: ext. 101</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>appointments@wecarehospital.org</span>
              </div>
            </div>
          </div>

          {/* Col 2: Clinical Departments */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Departments</h4>
            <ul className="space-y-2 text-xs">
              {DEPARTMENTS.slice(0, 6).map((dept) => (
                <li key={dept.id}>
                  <button
                    onClick={() => {
                      onSelectTab('departments');
                      onSelectDepartment(dept.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {dept.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => {
                    onSelectTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Our Hospital
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab('departments');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Medical Departments
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onSelectTab('doctors');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Physicians & Specialists
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenBooking}
                  className="text-teal-400 hover:text-teal-300 font-medium transition-colors cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quality & Trust */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Accreditations</h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>JCI Gold Seal of Approval</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NABH Super Specialty Accreditation</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Magnet Nursing Recognition</span>
              </div>
              <p className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                Licensed by the State Department of Health Services. An Equal Opportunity Healthcare Provider.
              </p>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WeCare Hospital. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 text-center sm:text-right">
            Medical Disclaimer: In case of life-threatening emergency, call 911 or proceed immediately to the nearest Emergency Department.
          </p>
        </div>
      </div>
    </footer>
  );
};
