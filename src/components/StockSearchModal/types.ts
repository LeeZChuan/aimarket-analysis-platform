import { Stock } from '../../types/stock';

export interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (stock: Stock) => void;
}

export type Region = 'all' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'africa' | 'oceania' | 'antarctica';
