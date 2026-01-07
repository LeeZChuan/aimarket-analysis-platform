import { toast } from 'sonner';

type NotifyLevel = 'success' | 'info' | 'warning' | 'error';

function canNotify(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function format(message: string, detail?: string): string {
  return detail ? `${message}：${detail}` : message;
}

export function notify(level: NotifyLevel, message: string, detail?: string): void {
  if (!canNotify()) return;
  const text = format(message, detail);
  if (level === 'success') toast.success(text);
  else if (level === 'warning') toast.warning(text);
  else if (level === 'error') toast.error(text);
  else toast.message(text);
}

export function notifyError(message: string, detail?: string): void {
  notify('error', message, detail);
}

export function notifyWarning(message: string, detail?: string): void {
  notify('warning', message, detail);
}

export function notifySuccess(message: string, detail?: string): void {
  notify('success', message, detail);
}


