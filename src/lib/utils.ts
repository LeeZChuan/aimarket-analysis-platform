import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui 常用工具：合并 className（clsx + tailwind-merge）
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


