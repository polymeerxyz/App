import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LockState {
  lock: Record<string, boolean>;
  updateLock: (lock: { [id: string]: boolean }) => void;
}

const useLockStoreBase = create<LockState>()(
  immer((set) => ({
    lock: {},
    updateLock: (lock: { [id: string]: boolean }) => {
      set((state) => {
        for (const id in lock) {
          state.lock[id] = lock[id];
        }
      });
    },
  })),
);

export const useLockStore = useLockStoreBase;
