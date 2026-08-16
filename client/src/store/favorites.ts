import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id) ? state.ids.filter((i) => i !== id) : [...state.ids, id],
        })),
      isFavorite: (id) => get().ids.includes(id),
    }),
    { name: "vapeshop-favorites" }
  )
);
