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
  adminModeActive: boolean;
  loading: boolean;
  setSession: (user: SessionUser, isAdmin: boolean) => void;
  toggleAdminMode: () => void;
  setLoading: (v: boolean) => void;
};

export const useSession = create<SessionState>((set) => ({
  user: null,
  isAdmin: false,
  adminModeActive: false,
  loading: true,
  setSession: (user, isAdmin) => set({ user, isAdmin, loading: false }),
  toggleAdminMode: () => set((s) => ({ adminModeActive: !s.adminModeActive })),
  setLoading: (v) => set({ loading: v }),
}));
