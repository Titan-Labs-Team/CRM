import { create } from 'zustand';

type Plan = 'starter' | 'pro' | 'enterprise';

interface UpgradeState {
  open: boolean;
  requiredPlan: Plan | null;
  showUpgrade: (requiredPlan: Plan) => void;
  closeUpgrade: () => void;
}

export const useUpgradeStore = create<UpgradeState>((set) => ({
  open: false,
  requiredPlan: null,
  showUpgrade: (requiredPlan) => set({ open: true, requiredPlan }),
  closeUpgrade: () => set({ open: false, requiredPlan: null }),
}));
