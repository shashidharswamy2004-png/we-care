import React, { useState } from 'react';
import { Menu, X, CalendarCheck, User as UserIcon, LogOut, ChevronDown, Stethoscope, ShieldCheck, FileCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter } from './NotificationCenter';

export type NavTab =
  | 'home'
  | 'about'
  | 'departments'
  | 'doctors'
  | 'doctor-apply'
  | 'doctor-status'
  | 'doctor-login'
  | 'doctor-dashboard'
  | 'admin-verify';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenBooking: () => void;
  onOpenMyAppointments: () => void;
  onOpenAuth: () => void;
  appointmentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenBooking,
  onOpenMyAppointments,
  onOpenAuth,
  appointmentCount
}) => {
  const { user, logout, isDoctor, isAdmin, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks: { id: NavTab; label: string }[] = isDoctor ? [] : [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'departments', label: 'Departments' },
    { id: 'doctors', label: 'Doctors' }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => handleNavClick(isDoctor ? 'doctor-dashboard' : 'home')}
            className="flex items-center gap-2.5 text-left text-slate-900 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md"
            aria-label="WeCare Hospital Home"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
              <span className="leading-none text-white font-extrabold">+</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap leading-tight">
                WeCare Hospital
              </span>
              <span className="text-[11px] font-medium text-teal-800 tracking-wider uppercase">
                Center of Excellence
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative py-1 whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'text-teal-700 font-semibold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-700 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Doctor Portal shortcut */}
            {isDoctor ? (
              <button
                onClick={() => handleNavClick('doctor-dashboard')}
                className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'doctor-dashboard' ? 'text-teal-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Doctor Portal</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('doctor-apply')}
                className={`py-1 text-slate-500 hover:text-teal-700 transition-colors whitespace-nowrap cursor-pointer text-xs font-semibold ${
                  activeTab === 'doctor-apply' ? 'text-teal-700 font-bold' : ''
                }`}
              >
                Join as Doctor
              </button>
            )}

            {/* Admin Console shortcut for administrators */}
            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin-verify')}
                className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === 'admin-verify' ? 'text-amber-700 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Console</span>
              </button>
            )}

            {/* My Visits Portal */}
            {!isDoctor && (
              <button
                onClick={onOpenMyAppointments}
                className="flex items-center gap-1.5 py-1 text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-teal-600" />
                <span>My Visits</span>
                {appointmentCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center text-[10px] font-bold w-4 h-4 rounded-full bg-teal-100 text-teal-800">
                    {appointmentCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {user && !isAdmin && <NotificationCenter userId={user.uid} />}

          {/* Zone 3: Authentication and Primary Action */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                      isAdmin ? 'bg-amber-600' : isDoctor ? 'bg-teal-700' : 'bg-slate-700'
                    }`}>
                      {isAdmin ? 'A' : isDoctor ? 'Dr' : user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs divide-y divide-slate-100">
                    <div className="px-3.5 py-2.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.displayName || 'User'}
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                          {role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {isDoctor ? (
                        <button
                          onClick={() => handleNavClick('doctor-dashboard')}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-teal-800 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span>Doctor Dashboard</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNavClick('doctor-login')}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Stethoscope className="w-4 h-4 text-slate-500" />
                          <span>Doctor Sign In</span>
                        </button>
                      )}

                      {!isDoctor && (
                        <>
                          <button
                            onClick={() => handleNavClick('doctor-status')}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span>Track Doctor Application</span>
                          </button>

                          <button
                            onClick={() => handleNavClick('doctor-apply')}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                          >
                            <FileCheck className="w-4 h-4 text-slate-500" />
                            <span>Join as a Doctor</span>
                          </button>
                        </>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleNavClick('admin-verify')}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-amber-800 font-semibold flex items-center gap-2 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Admin Console</span>
                        </button>
                      )}

                      {!isDoctor && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onOpenMyAppointments();
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <CalendarCheck className="w-4 h-4 text-teal-600" />
                          <span>My Booked Visits</span>
                        </button>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {!isDoctor && (
              <button
                onClick={onOpenBooking}
                className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                Book Appointment
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            {isDoctor && (
              <button
                onClick={() => handleNavClick('doctor-dashboard')}
                className="text-left py-2 px-3 rounded-lg bg-teal-50 text-teal-800 font-bold"
              >
                Doctor Portal
              </button>
            )}
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left py-2 px-3 rounded-lg ${
                  activeTab === link.id ? 'bg-teal-50 text-teal-800 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}

            {!isDoctor && (
              <>
                <button
                  onClick={() => handleNavClick('doctor-apply')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 text-teal-700 font-semibold"
                >
                  Join as a Doctor
                </button>

                <button
                  onClick={() => handleNavClick('doctor-status')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  Track Application Status
                </button>

                <button
                  onClick={() => handleNavClick('doctor-login')}
                  className="text-left py-2 px-3 rounded-lg hover:bg-slate-50"
                >
                  Doctor Sign In / Dashboard
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNavClick('admin-verify')}
                className="text-left py-2 px-3 rounded-lg bg-amber-50 text-amber-800 font-semibold"
              >
                Admin Verification Console
              </button>
            )}

            {!isDoctor && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenMyAppointments();
                }}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                <span>My Visits</span>
                {appointmentCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                    {appointmentCount}
                  </span>
                )}
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Sign Out ({user.email})
              </button>
            ) : (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAuth(); }}
                className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Sign In
              </button>
            )}
            {!isDoctor && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenBooking(); }}
                className="w-full py-2.5 bg-teal-700 text-white font-semibold text-xs rounded-xl"
              >
                Book Appointment
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
