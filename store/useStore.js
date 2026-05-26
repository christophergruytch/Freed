import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create((set, get) => ({
    // State
    streak: 0,
    freedomStartDate: null,
    relapseHistory: [],
    isFaithBased: true,

    // Actions
    setStreak: (newStreak) => set({ streak: newStreak }),

    setFreedomStartDate: (date) => set({ freedomStartDate: date }),

    setRelapseHistory: (history) => set({ relapseHistory: history }),

    setIsFaithBased: (value) => set({ isFaithBased: value }),

    // Load all data
    loadAllData: async () => {
        try {
            const savedStreak = await AsyncStorage.getItem('streak');
            const savedFreedomStart = await AsyncStorage.getItem('freedomStartDate');
            const savedRelapses = await AsyncStorage.getItem('relapseHistory');
            const savedFaith = await AsyncStorage.getItem('isFaithBased');

            if (savedStreak) set({ streak: parseInt(savedStreak) });
            if (savedFreedomStart) set({ freedomStartDate: new Date(savedFreedomStart) });
            if (savedRelapses) set({ relapseHistory: JSON.parse(savedRelapses) });
            if (savedFaith !== null) set({ isFaithBased: savedFaith === 'true' });
        } catch (e) {
            console.log("Failed to load data", e);
        }
    },

    // Save all data
    saveAllData: async () => {
        try {
            const state = get();
            await AsyncStorage.setItem('streak', state.streak.toString());
            if (state.freedomStartDate) {
                await AsyncStorage.setItem('freedomStartDate', state.freedomStartDate.toISOString());
            }
            await AsyncStorage.setItem('relapseHistory', JSON.stringify(state.relapseHistory));
            await AsyncStorage.setItem('isFaithBased', state.isFaithBased.toString());
        } catch (e) {
            console.log("Failed to save data", e);
        }
    },
}));

export default useStore;