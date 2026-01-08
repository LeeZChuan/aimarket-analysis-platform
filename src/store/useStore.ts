import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Stock } from '../types/stock';
import { AIMessage } from '../types/ai';
import { stockService } from '../services/stockService';
import { notifySuccess } from '../utils/notify';

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
  watchlistLoading: boolean;
  messages: Message[];
  selectedModel: string;
  user: User | null;
  isAuthenticated: boolean;

  setSelectedStock: (stock: Stock | null) => void;
  setWatchlist: (stocks: Stock[]) => void;
  loadWatchlist: () => Promise<void>;
  addToWatchlist: (stock: Stock) => Promise<void>;
  removeFromWatchlist: (symbol: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setSelectedModel: (model: string) => void;
  login: (email: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedStock: null,
      watchlist: [],
      watchlistLoading: false,
      messages: [],
      selectedModel: 'auto',
      user: null,
      isAuthenticated: false,

      setSelectedStock: (stock) => set({ selectedStock: stock }),

      setWatchlist: (stocks) => set({ watchlist: stocks }),

      // 从后端加载自选股
      loadWatchlist: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;

        set({ watchlistLoading: true });
        try {
          const response = await stockService.getWatchlist();
          set({ watchlist: response.watchlist });
        } catch (error) {
          console.error('Failed to load watchlist:', error);
        } finally {
          set({ watchlistLoading: false });
        }
      },

      addToWatchlist: async (stock) => {
        set((state) => ({
          watchlist: [...state.watchlist, stock],
        }));
        // 同步到后端（异步，不阻塞UI），成功后提示
        try {
          const ok = await stockService.addToWatchlist(stock);
          if (ok) {
            notifySuccess('已添加到自选股');
          }
        } catch (e) {
          console.error(e);
        }
      },

      removeFromWatchlist: (symbol) => {
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s.symbol !== symbol),
        }));
        // 同步到后端（异步，不阻塞UI）
        stockService.removeFromWatchlist(symbol).catch(console.error);
      },

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
            },
          ],
        })),

      setSelectedModel: (model) => set({ selectedModel: model }),

      login: (email) => {
        set({
          user: { email, name: email.split('@')[0] },
          isAuthenticated: true,
        });
        // 登录后加载自选股
        get().loadWatchlist();
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          watchlist: [],
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
