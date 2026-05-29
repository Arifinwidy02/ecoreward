import { create } from 'zustand';
import type { Transaction } from '../types/models';
import { getTransactionsByUser } from '../services/transactionService';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  hasMore: boolean;
  loadTransactions: (userId: string, type?: 'deposit' | 'redemption') => Promise<void>;
  loadMore: (userId: string, type?: 'deposit' | 'redemption') => Promise<void>;
}

const PAGE_SIZE = 20;

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  hasMore: true,

  loadTransactions: async (userId, type) => {
    set({ isLoading: true });
    const transactions = await getTransactionsByUser(userId, type, PAGE_SIZE, 0);
    set({
      transactions,
      isLoading: false,
      hasMore: transactions.length === PAGE_SIZE,
    });
  },

  loadMore: async (userId, type) => {
    const { transactions, isLoading, hasMore } = get();
    if (isLoading || !hasMore) return;
    set({ isLoading: true });
    const more = await getTransactionsByUser(userId, type, PAGE_SIZE, transactions.length);
    set({
      transactions: [...transactions, ...more],
      isLoading: false,
      hasMore: more.length === PAGE_SIZE,
    });
  },
}));
