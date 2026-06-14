import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { uz } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, fmt = 'dd.MM.yyyy') {
  return format(new Date(date), fmt, { locale: uz });
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: uz });
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'HH:mm');
}

export function getTodayRange() {
  const now = new Date();
  return {
    from: startOfDay(now).toISOString(),
    to: endOfDay(now).toISOString(),
  };
}

export function getWeekRange() {
  const now = new Date();
  return {
    from: startOfWeek(now, { weekStartsOn: 1 }).toISOString(),
    to: endOfWeek(now, { weekStartsOn: 1 }).toISOString(),
  };
}

export function getMonthRange() {
  const now = new Date();
  return {
    from: startOfMonth(now).toISOString(),
    to: endOfMonth(now).toISOString(),
  };
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getAvatarColor(id: string) {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  ];
  const index = id.charCodeAt(0) % colors.length;
  return colors[index];
}

export async function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation qo\'llab-quvvatlanmaydi'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function truncate(str: string, length = 50) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
