import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock } from '../types/stock';
import { AIMessage } from '../types/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string | AIMessage;
  timestamp: Date;
}

interface User {
  email: string;
  name: string;
}

interface AppState {
  selectedStock: Stock | null;
  watchlist: Stock[];
  messages: Message[];
  selectedModel: string;
  dateRange: { start: string; end: string };
  user: User | null;
  isAuthenticated: boolean;

  setSelectedStock: (stock: Stock | null) => void;
  addToWatchlist: (stock: Stock) => void;
  removeFromWatchlist: (symbol: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (model: string) => void;
  setDateRange: (range: { start: string; end: string }) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedStock: null,
      watchlist: [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.34, marketCap: 2800000000000, volume: 52340000, sector: 'Technology' },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: -1.23, marketCap: 2820000000000, volume: 28450000, sector: 'Technology' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: 0.87, marketCap: 1780000000000, volume: 21560000, sector: 'Technology' },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: 3.24, marketCap: 789000000000, volume: 89560000, sector: 'Automotive' },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.20, change: -1.15, marketCap: 1220000000000, volume: 42340000, sector: 'Technology' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.35, change: 2.10, marketCap: 1850000000000, volume: 35670000, sector: 'Consumer Cyclical' },
      ],
      messages: [],
      selectedModel: 'auto',
      dateRange: { start: '2024-06-01', end: '2024-10-25' },
      user: null,
      isAuthenticated: false,

      setSelectedStock: (stock) => set({ selectedStock: stock }),

      addToWatchlist: (stock) => set((state) => ({
        watchlist: [...state.watchlist, stock]
      })),

      removeFromWatchlist: (symbol) => set((state) => ({
        watchlist: state.watchlist.filter(s => s.symbol !== symbol)
      })),

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }]
      })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      setDateRange: (range) => set({ dateRange: range }),

      login: (email) => set({
        user: { email, name: email.split('@')[0] },
        isAuthenticated: true
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
