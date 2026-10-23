import React, { useEffect, useState } from 'react';
import { Bell, Check, LoaderCircle } from 'lucide-react';
import { sqlApi } from '../lib/sqlClient';
import { AppNotification } from '../types/hospital';

interface NotificationCenterProps {
  userId: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    const loadNotifications = async () => {
      try {
        const response = await sqlApi.getNotifications(userId);
        if (isActive) {
          setNotifications(response.notifications);
          setError('');
        }
      } catch (loadError) {
        console.error('Could not load notifications:', loadError);
        if (isActive) setError('Notifications could not be loaded.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadNotifications();
    const intervalId = window.setInterval(() => void loadNotifications(), 30000);
    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [userId]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleNotificationClick = async (notification: AppNotification) => {
    if (notification.isRead) return;
    try {
      await sqlApi.markNotificationRead(notification.id, userId);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      ));
    } catch (markError) {
      console.error('Could not mark notification as read:', markError);
      setError('This notification could not be marked as read.');
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-teal-700"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
              <p className="text-[11px] text-slate-500">{unreadCount} unread</p>
            </div>
            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin text-teal-700" />}
          </div>
          {error && <p role="alert" className="px-4 py-2 text-xs text-rose-700">{error}</p>}
          {!isLoading && notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-500">You’re all caught up.</p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    onClick={() => void handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left transition hover:bg-slate-50 ${notification.isRead ? 'bg-white' : 'bg-teal-50/60'}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-xs font-semibold text-slate-900">{notification.title}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-600">{notification.message}</span>
                        <time className="mt-1.5 block text-[10px] text-slate-400">
                          {new Date(notification.createdAt).toLocaleString()}
                        </time>
                      </span>
                      {notification.isRead ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-label="Read" />
                      ) : (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal-600" aria-label="Unread" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};
