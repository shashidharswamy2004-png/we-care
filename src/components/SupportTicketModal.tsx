import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, LifeBuoy, RefreshCw, Send, ShieldCheck, Trash2, X } from 'lucide-react';
import { AppUser } from '../context/AuthContext';
import { sqlApi } from '../lib/sqlClient';
import { SupportTicketCategory, SupportTicketReceipt, SupportTicketSummary } from '../types/hospital';

interface SupportTicketModalProps {
  isOpen: boolean;
  user: AppUser | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

const MAX_IMAGE_SIZE = 1_000_000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const SupportTicketModal: React.FC<SupportTicketModalProps> = ({
  isOpen,
  user,
  onClose,
  onOpenAuth
}) => {
  const [category, setCategory] = useState<SupportTicketCategory>('Appointment');
  const [message, setMessage] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SupportTicketReceipt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<'new' | 'tickets'>('new');
  const [tickets, setTickets] = useState<SupportTicketSummary[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setCategory('Appointment');
    setMessage('');
    setImageDataUrl('');
    setImageName('');
    setError(null);
    setReceipt(null);
    setSubmitting(false);
    setView('new');
    setTickets([]);
    setLoadingTickets(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageChange = (file?: File) => {
    setError(null);
    setImageDataUrl('');
    setImageName('');
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('The image must be 1 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Could not read that image. Please try another file.');
        return;
      }
      setImageDataUrl(reader.result);
      setImageName(file.name);
    };
    reader.onerror = () => setError('Could not read that image. Please try another file.');
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!user || (user.role !== 'patient' && user.role !== 'doctor')) {
      setError('Sign in as a patient or doctor to send a support ticket.');
      return;
    }
    if (!message.trim()) {
      setError('Describe the problem so our support team can help.');
      return;
    }
    if (!imageDataUrl) {
      setError('Attach a screenshot or problem image before sending.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await sqlApi.createSupportTicket({
        userId: user.uid,
        userRole: user.role,
        userName: user.displayName,
        userEmail: user.email,
        category,
        message: message.trim(),
        imageDataUrl
      });
      setReceipt(response.ticket);
    } catch (submitError: any) {
      setError(submitError?.message || 'Could not send your ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadTickets = async () => {
    if (!user) return;
    setError(null);
    setView('tickets');
    setLoadingTickets(true);
    try {
      const response = await sqlApi.getMySupportTickets(user.uid);
      setTickets(response.tickets);
    } catch (ticketError: any) {
      setError(ticketError?.message || 'Could not load your support tickets. Please try again.');
    } finally {
      setLoadingTickets(false);
    }
  };

  const canSubmit = user?.role === 'patient' || user?.role === 'doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-ticket-title"
        className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="h-1 bg-gradient-to-r from-teal-700 via-cyan-500 to-emerald-400" />
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
              <LifeBuoy className="h-5 w-5" />
            </span>
            <div>
              <h2 id="support-ticket-title" className="text-base font-bold text-slate-900">Contact support</h2>
              <p className="text-xs text-slate-500">Send a problem description and image to our team.</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close support form" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5 sm:p-6">
          {canSubmit && (
            <div className="flex gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  setView('new');
                  setError(null);
                  setReceipt(null);
                  setCategory('Appointment');
                  setMessage('');
                  setImageDataUrl('');
                  setImageName('');
                }}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${view === 'new' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                New ticket
              </button>
              <button
                type="button"
                onClick={() => void loadTickets()}
                disabled={loadingTickets}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${view === 'tickets' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} disabled:opacity-60`}
              >
                {loadingTickets && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                My tickets
              </button>
            </div>
          )}

          {error && view === 'tickets' && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
            </p>
          )}

          {view === 'tickets' && canSubmit ? (
            <div className="space-y-3">
              {loadingTickets ? (
                <p className="py-8 text-center text-sm text-slate-500">Loading your tickets...</p>
              ) : tickets.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">You have not submitted any support tickets yet.</p>
              ) : tickets.map((ticket) => (
                <article key={ticket.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-slate-800">{ticket.id}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.category} · {new Date(ticket.createdAt).toLocaleString()}</p>
                    {ticket.resolvedAt && <p className="mt-1 text-[11px] text-slate-500">Resolved {new Date(ticket.resolvedAt).toLocaleString()}</p>}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {ticket.status === 'resolved' ? 'Resolved' : 'Open'}
                  </span>
                </article>
              ))}
              <button type="button" onClick={() => void loadTickets()} disabled={loadingTickets} className="inline-flex items-center gap-2 text-xs font-semibold text-teal-800 hover:text-teal-900 disabled:opacity-60">
                <RefreshCw className={`h-3.5 w-3.5 ${loadingTickets ? 'animate-spin' : ''}`} />
                Refresh status
              </button>
            </div>
          ) : receipt && view === 'new' ? (
            <div className="space-y-4 py-5 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ticket sent</h3>
                <p className="mt-1 text-sm text-slate-600">Our support team has received your request. Status: <span className="font-semibold text-amber-800">Open</span></p>
              </div>
              <p className="inline-flex rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-800">
                {receipt.id}
              </p>
              <div>
                <button type="button" onClick={() => void loadTickets()} className="mr-2 rounded-lg border border-teal-700 px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50">
                  View ticket status
                </button>
                <button type="button" onClick={handleClose} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                  Done
                </button>
              </div>
            </div>
          ) : !user ? (
            <div className="space-y-4 py-5 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-teal-700" />
              <div>
                <h3 className="font-bold text-slate-900">Sign in to contact support</h3>
                <p className="mt-1 text-sm text-slate-600">Tickets are linked to your patient or doctor account.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  onOpenAuth();
                }}
                className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Sign in
              </button>
            </div>
          ) : !canSubmit ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Support tickets are available for patient and doctor accounts.</p>
          ) : view === 'new' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500">Submitting as</span>
                  <span className="mt-0.5 block truncate text-sm font-semibold capitalize text-slate-800">{user.role}</span>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Issue type</span>
                  <select value={category} onChange={(event) => setCategory(event.target.value as SupportTicketCategory)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                    <option>Appointment</option>
                    <option>Account</option>
                    <option>Website issue</option>
                    <option>Other</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">What problem are you experiencing?</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  required
                  maxLength={3000}
                  rows={5}
                  placeholder="Describe what happened and what you were trying to do..."
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
                <span className="mt-1 block text-right text-[10px] text-slate-400">{message.length}/3000</span>
              </label>

              <div>
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">Problem image <span className="text-rose-600">*</span></span>
                {imageDataUrl ? (
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <img src={imageDataUrl} alt="Selected problem attachment preview" className="h-16 w-20 rounded-md border border-slate-200 object-cover" />
                    <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{imageName}</span>
                    <button type="button" onClick={() => handleImageChange()} aria-label="Remove image" className="rounded-md p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-teal-400 hover:bg-teal-50/50">
                    <ImagePlus className="h-6 w-6 text-teal-700" />
                    <span className="text-xs font-semibold text-slate-700">Choose a problem image</span>
                    <span className="text-[10px] text-slate-500">JPG, PNG, or WebP · up to 1 MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only" onChange={(event) => handleImageChange(event.target.files?.[0])} />
                  </label>
                )}
              </div>

              {error && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}
                </p>
              )}

              <button type="submit" disabled={submitting || !imageDataUrl} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
                <Send className="h-4 w-4" />
                {submitting ? 'Sending ticket...' : 'Send support ticket'}
              </button>
            </form>
          ) : null}
        </div>
      </section>
    </div>
  );
};