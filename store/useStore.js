import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create(
    persist(
        (set, get) => ({
            // State
            streak: 0,
            freedomStartDate: null, // Stored as Date in memory, serialized to ISO string
            relapseHistory: [],
            isFaithBased: true,
            hasCompletedOnboarding: false,
            activeDays: [], // array of 'YYYY-MM-DD' strings for days the app was opened

            // Notification settings
            notificationsEnabled: true,
            notificationTime: '20:00', // HH:mm format
            customNotificationMessage: '', // optional custom message

            // User-added playlists for the Music / Community section
            userPlaylists: [],

            // Saved reflections from "Facing Temptation" / Pause & Reflect feature
            temptationReflections: [],

            // User nickname for personal greeting
            nickname: '',

            // Personal journal entries (separate from reflections for free-form processing)
            journalEntries: [],

            // Single personal note for the Learn tab (user's private motivation / reminders)
            personalNote: '',

            // Quiet hours for notifications
            quietHours: {
                enabled: false,
                start: '22:00', // HH:mm
                end: '07:00',
            },

            // Enabled notification types
            notificationTypes: {
                daily: true,
                streak: true,
                journal: true,
                motivational: true,
            },

            // Saved protect / barrier schedules
            protectSchedules: [],

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

            // Journal actions
            addJournalEntry: (entry) =>
                set((state) => ({
                    journalEntries: [entry, ...state.journalEntries],
                })),

            updateJournalEntry: (id, updates) =>
                set((state) => ({
                    journalEntries: state.journalEntries.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                })),

            deleteJournalEntry: (id) =>
                set((state) => ({
                    journalEntries: state.journalEntries.filter((e) => e.id !== id),
                })),

            // Add today's date if it's not already recorded
            addActiveDay: (dateString) =>
                set((state) => {
                    if (state.activeDays.includes(dateString)) {
                        return {};
                    }
                    return {
                        activeDays: [...state.activeDays, dateString].sort(),
                    };
                }),

            resetActiveDays: () => set({ activeDays: [] }),

            // Notification settings actions
            setNotificationSettings: (settings) => set((state) => ({
                ...state,
                ...settings,
            })),

            // Music / Community playlists actions
            addUserPlaylist: (playlist) =>
                set((state) => ({
                    userPlaylists: [...state.userPlaylists, { ...playlist, id: Date.now().toString() }],
                })),

            deleteUserPlaylist: (id) =>
                set((state) => ({
                    userPlaylists: state.userPlaylists.filter((p) => p.id !== id),
                })),

            updateUserPlaylist: (id, updates) =>
                set((state) => ({
                    userPlaylists: state.userPlaylists.map((p) =>
                        p.id === id ? { ...p, ...updates } : p
                    ),
                })),

            // Temptation Reflection actions
            addTemptationReflection: (reflection) =>
                set((state) => ({
                    temptationReflections: [
                        { ...reflection, id: Date.now().toString() },
                        ...state.temptationReflections,
                    ],
                })),

            deleteTemptationReflection: (id) =>
                set((state) => ({
                    temptationReflections: state.temptationReflections.filter((r) => r.id !== id),
                })),

            // Nickname
            setNickname: (name) => set({ nickname: name.trim() }),

            // Personal note (Learn tab)
            setPersonalNote: (note) => set({ personalNote: (note || '').trim() }),

            // Quiet hours
            setQuietHours: (quietHours) => set({ quietHours }),

            // Notification types
            setNotificationTypes: (types) => set({ notificationTypes: { ...get().notificationTypes, ...types } }),

            // Protect schedules
            addProtectSchedule: (schedule) => set((state) => ({
                protectSchedules: [...state.protectSchedules, { ...schedule, id: Date.now().toString() }],
            })),
            deleteProtectSchedule: (id) => set((state) => ({
                protectSchedules: state.protectSchedules.filter((s) => s.id !== id),
            })),

            // Calculate current consecutive streak (ending today or yesterday)
            getCurrentStreak: () => {
                const { activeDays } = get();
                if (!activeDays || activeDays.length === 0) return 0;

                const sorted = [...activeDays].sort().reverse(); // newest first

                let streak = 0;
                let expectedDate = new Date();
                expectedDate.setHours(0, 0, 0, 0);

                for (let dateStr of sorted) {
                    const [y, m, d] = dateStr.split('-').map(Number);
                    const activeDate = new Date(y, m - 1, d);
                    activeDate.setHours(0, 0, 0, 0);

                    const diff = Math.floor((expectedDate - activeDate) / (1000 * 60 * 60 * 24));

                    if (diff === 0 || diff === 1) {
                        streak++;
                        expectedDate = new Date(activeDate);
                        expectedDate.setDate(expectedDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                return streak;
            },
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
                activeDays: state.activeDays,
                // Notification settings (persist so daily reminder survives restarts)
                notificationsEnabled: state.notificationsEnabled,
                notificationTime: state.notificationTime,
                customNotificationMessage: state.customNotificationMessage,
                // User playlists for Community Music section
                userPlaylists: state.userPlaylists,
                // Temptation reflections for Insights & History
                temptationReflections: state.temptationReflections,
                // Nickname for personal greeting on Home
                nickname: state.nickname,
                // Journal entries for personal processing and growth tracking
                journalEntries: state.journalEntries,
                // User's personal note from the Learn tab
                personalNote: state.personalNote,
                // Quiet hours
                quietHours: state.quietHours,
                // Notification types
                notificationTypes: state.notificationTypes,
                // Protect schedules
                protectSchedules: state.protectSchedules,
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