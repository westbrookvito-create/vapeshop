import { create } from "zustand";

export type SessionUser = {
  telegramId: number;
  firstName: string;
  lastName: string;
  username: string;
  bonusPoints: number;
};

type SessionState = {
  user: SessionUser | null;
  isAdmin: boolean;
  loading: boolean;
  setSession: (user: SessionUser, isAdmin: boolean) => void;
  addBonusPoints: (n: number) => void;
  setLoading: (v: boolean) => void;
};

export const useSession = create<SessionState>((set) => ({
  user: null,
  isAdmin: false,
  loading: true,
  setSession: (user, isAdmin) => set({ user, isAdmin, loading: false }),
  addBonusPoints: (n) => set((s) => (s.user ? { user: { ...s.user, bonusPoints: s.user.bonusPoints + n } } : s)),
  setLoading: (v) => set({ loading: v }),
}));
