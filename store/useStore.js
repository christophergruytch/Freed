import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
    persist(
        (set) => ({
            // State
            streak: 0,
            freedomStartDate: null, // Stored as Date in memory, serialized to ISO string
            relapseHistory: [],
            isFaithBased: true,
            hasCompletedOnboarding: false,

            // Actions
            setStreak: (newStreak) => set({ streak: newStreak }),

            setFreedomStartDate: (date) => set({ freedomStartDate: date }),

            setRelapseHistory: (history) => set({ relapseHistory: history }),

            // Convenience method for adding a new rich relapse (newest first)
            addRelapse: (newRelapse) =>
                set((state) => ({
                    relapseHistory: [newRelapse, ...state.relapseHistory],
                })),

            setIsFaithBased: (value) => set({ isFaithBased: value }),

            setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
        }),
        {
            name: 'freed-app-storage',
            storage: createJSONStorage(() => AsyncStorage),

            // Only persist the fields we care about
            partialize: (state) => ({
                streak: state.streak,
                // Convert Date to ISO string for safe serialization
                freedomStartDate: state.freedomStartDate
                    ? state.freedomStartDate.toISOString()
                    : null,
                relapseHistory: state.relapseHistory,
                isFaithBased: state.isFaithBased,
                hasCompletedOnboarding: state.hasCompletedOnboarding,
            }),

            // Convert the ISO string back to a real Date object after loading
            onRehydrateStorage: () => (state) => {
                if (state?.freedomStartDate) {
                    state.freedomStartDate = new Date(state.freedomStartDate);
                }
            },
        }
    )
);

export default useStore;