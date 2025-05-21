import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(date: string | Date, formatString: string = 'h:mm a'): string {
  return format(new Date(date), formatString);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy h:mm a');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getCaseStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-success-100 text-success-800';
    case 'in_review':
      return 'bg-warning-100 text-warning-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getAppointmentStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-warning-100 text-warning-800';
    case 'confirmed':
      return 'bg-success-100 text-success-800';
    case 'cancelled':
      return 'bg-error-100 text-error-800';
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getInvoiceStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-warning-100 text-warning-800';
    case 'paid':
      return 'bg-success-100 text-success-800';
    case 'overdue':
      return 'bg-error-100 text-error-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
 export const formatDate = (isoString: string): string => {
  // Fix the format if needed
  if (!isoString) return "N/A"; 
  const safeIso = isoString.replace(' ', 'T');
  const date = new Date(safeIso);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

