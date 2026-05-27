// pages/JournalScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function JournalScreen() {
    const { relapseHistory, setRelapseHistory } = useStore();

    const [activeTab, setActiveTab] = useState('journal');
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');

    // One-time migration: wipe old simple-format relapse data
    useEffect(() => {
        const hasOldFormat = relapseHistory.some(
            (r) => r.date && !r.timestamp
        );
        if (hasOldFormat && relapseHistory.length > 0) {
            console.log("Wiping old relapse data format...");
            setRelapseHistory([]);
        }
    }, []);

    // === Insights Calculations ===
    const getInsights = (history) => {
        if (!history || history.length === 0) return null;

        const total = history.length;

        // Count trigger apps
        const appCounts = {};
        const locationCounts = {};
        const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

        history.forEach((relapse) => {
            // Trigger app
            const app = relapse.triggerApp || 'Unknown';
            appCounts[app] = (appCounts[app] || 0) + 1;

            // Location
            if (relapse.location) {
                locationCounts[relapse.location] = (locationCounts[relapse.location] || 0) + 1;
            }

            // Time of day
            if (relapse.timestamp) {
                const hour = new Date(relapse.timestamp).getHours();
                if (hour >= 5 && hour < 12) timeBuckets.Morning++;
                else if (hour >= 12 && hour < 17) timeBuckets.Afternoon++;
                else if (hour >= 17 && hour < 22) timeBuckets.Evening++;
                else timeBuckets.Night++;
            }
        });

        // Sort and get top entries
        const topApps = Object.entries(appCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([app, count]) => ({ app, count }));

        const topLocations = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([loc, count]) => ({ location: loc, count }));

        return {
            total,
            topApps,
            topLocations,
            timeBuckets,
        };
    };

    const insights = getInsights(relapseHistory);

    // Load journal entries
    useEffect(() => {
        const loadJournal = async () => {
            try {
                const savedJournal = await AsyncStorage.getItem('journalEntries');
                if (savedJournal) {
                    setJournalEntries(JSON.parse(savedJournal));
                }
            } catch (e) {
                console.log("Failed to load journal");
            }
        };
        loadJournal();
    }, []);

    // Save journal entries
    useEffect(() => {
        AsyncStorage.setItem('journalEntries', JSON.stringify(journalEntries));
    }, [journalEntries]);

    const addJournalEntry = () => {
        if (newEntry.trim() === '') return;
        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            text: newEntry.trim()
        };
        setJournalEntries([entry, ...journalEntries]);
        setNewEntry('');
        Alert.alert("Saved", "Journal entry recorded.");
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditText(journalEntries[index].text);
    };

    const saveEdit = () => {
        if (editText.trim() === '') return;
        const updatedEntries = [...journalEntries];
        updatedEntries[editingIndex] = {
            ...updatedEntries[editingIndex],
            text: editText.trim(),
            date: new Date().toLocaleDateString()
        };
        setJournalEntries(updatedEntries);
        setEditingIndex(null);
        setEditText('');
        Alert.alert("Updated", "Journal entry has been updated.");
    };

    const deleteJournalEntry = (id) => {
        setJournalEntries(journalEntries.filter(e => e.id !== id));
    };

    return (
        <View 
            style={styles.container} 
            onTouchStart={() => Keyboard.dismiss()}
        >
            <Text style={styles.title}>📓 My Journal</Text>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'journal' && styles.activeTab]}
                        onPress={() => setActiveTab('journal')}
                    >
                        <Text style={activeTab === 'journal' ? styles.activeTabText : styles.tabText}>Journal Entries</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'relapse' && styles.activeTab]}
                        onPress={() => setActiveTab('relapse')}
                    >
                        <Text style={activeTab === 'relapse' ? styles.activeTabText : styles.tabText}>Insights & History</Text>
                    </TouchableOpacity>
                </View>

            {activeTab === 'journal' ? (
                <View style={styles.content}>
                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind today?"
                        value={newEntry}
                        onChangeText={setNewEntry}
                        multiline
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={addJournalEntry}>
                        <Text style={styles.buttonText}>💾 Save Entry</Text>
                    </TouchableOpacity>

                    <FlatList
                        data={journalEntries}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item, index }) => (
                            <View style={styles.entryItem}>
                                <Text style={styles.entryDate}>{item.date}</Text>
                                {editingIndex === index ? (
                                    <TextInput
                                        style={styles.editInput}
                                        value={editText}
                                        onChangeText={setEditText}
                                        multiline
                                    />
                                ) : (
                                    <Text style={styles.entryText}>{item.text}</Text>
                                )}
                                <View style={styles.entryActions}>
                                    {editingIndex === index ? (
                                        <View style={styles.editActionsRow}>
                                            <TouchableOpacity style={styles.saveEditButton} onPress={saveEdit}>
                                                <Text style={styles.saveEditText}>💾 Save</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.cancelEditButton} onPress={() => setEditingIndex(null)}>
                                                <Text style={styles.cancelEditText}>Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={styles.normalActions}>
                                            <TouchableOpacity onPress={() => startEditing(index)}>
                                                <Text style={styles.editIcon}>✏️</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => deleteJournalEntry(item.id)}>
                                                <Text style={styles.deleteIcon}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet. Start writing above.</Text>}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 140 }}
                    />
                </View>
            ) : (
                <View style={styles.content}>
                    <FlatList
                        data={relapseHistory}
                        keyExtractor={(item) => item.id}
                        ListHeaderComponent={
                            insights ? (
                                <>
                                    <Text style={styles.sectionTitle}>Insights & History</Text>

                                    {/* Summary Stats */}
                                    <View style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>Summary</Text>
                                        <Text style={styles.insightBigNumber}>{insights.total}</Text>
                                        <Text style={styles.insightLabel}>Total Relapses Logged</Text>
                                    </View>

                                    {/* Top Trigger Apps */}
                                    {insights.topApps.length > 0 && (
                                        <View style={styles.insightCard}>
                                            <Text style={styles.insightTitle}>Top Trigger Apps</Text>
                                            {insights.topApps.map((item, index) => (
                                                <View key={index} style={styles.insightRow}>
                                                    <Text style={styles.insightText}>{item.app}</Text>
                                                    <Text style={styles.insightCount}>{item.count}x</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Time of Day */}
                                    <View style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>Time of Day</Text>
                                        {Object.entries(insights.timeBuckets).map(([time, count]) => (
                                            count > 0 && (
                                                <View key={time} style={styles.insightRow}>
                                                    <Text style={styles.insightText}>{time}</Text>
                                                    <Text style={styles.insightCount}>{count}x</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>

                                    {/* Top Locations */}
                                    {insights.topLocations.length > 0 && (
                                        <View style={styles.insightCard}>
                                            <Text style={styles.insightTitle}>Common Locations</Text>
                                            {insights.topLocations.map((item, index) => (
                                                <View key={index} style={styles.insightRow}>
                                                    <Text style={styles.insightText}>{item.location}</Text>
                                                    <Text style={styles.insightCount}>{item.count}x</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* History List Header */}
                                    <Text style={[styles.sectionTitle, { fontSize: 18, marginTop: 20 }]}>
                                        Relapse History
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.emptyText}>
                                    No relapses logged yet. When you log one from the Home screen, insights will appear here.
                                </Text>
                            )
                        }
                        renderItem={({ item }) => (
                            <View style={styles.relapseItem}>
                                <Text style={styles.relapseDate}>
                                    {new Date(item.timestamp).toLocaleString()}
                                </Text>

                                <Text style={styles.relapseApp}>
                                    {item.triggerApp}
                                    {item.triggerDescription ? ` — ${item.triggerDescription}` : ''}
                                </Text>

                                {item.location && (
                                    <Text style={styles.relapseLocation}>📍 {item.location}</Text>
                                )}

                                {item.note && (
                                    <Text style={styles.relapseNote}>{item.note}</Text>
                                )}
                            </View>
                        )}
                        ListEmptyComponent={null}
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{ paddingBottom: 140 }}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
    title: { ...theme.fonts.title, color: theme.colors.text, marginTop: 50, marginBottom: 20 },
    tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: theme.colors.card, borderRadius: 12, padding: 4 },
    tabButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: theme.colors.primary },
    tabText: { color: theme.colors.textSecondary },
    activeTabText: { color: '#ffffff', fontWeight: 'bold' },
    content: { flex: 1 },
    input: { backgroundColor: theme.colors.card, color: theme.colors.text, padding: 15, borderRadius: 12, minHeight: 100, marginBottom: 12 },
    saveButton: { backgroundColor: theme.colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#ffffff', fontWeight: 'bold' },
    sectionTitle: { fontSize: 22, color: theme.colors.text, marginBottom: 15 },
    entryItem: { backgroundColor: theme.colors.card, padding: 15, borderRadius: 12, marginBottom: 12 },
    entryDate: { color: theme.colors.primary, fontSize: 14 },
    entryText: { color: theme.colors.text, fontSize: 16, marginTop: 6 },
    editInput: { backgroundColor: '#1f1f1f', color: theme.colors.text, padding: 12, borderRadius: 10, minHeight: 80, marginVertical: 8 },
    normalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    editIcon: { fontSize: 22, marginRight: 20, color: '#4CAF50' },
    deleteIcon: { fontSize: 22, color: theme.colors.danger },
    editActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    saveEditButton: { backgroundColor: theme.colors.primary, paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, flex: 1, marginRight: 10, alignItems: 'center' },
    cancelEditButton: { backgroundColor: '#555', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 10, flex: 1, alignItems: 'center' },
    saveEditText: { color: '#ffffff', fontWeight: 'bold' },
    cancelEditText: { color: '#ffffff', fontWeight: 'bold' },
    relapseItem: { backgroundColor: theme.colors.card, padding: 15, borderRadius: 12, marginBottom: 12 },
    relapseDate: { color: theme.colors.primary, fontSize: 14 },
    relapseApp: { color: theme.colors.text, fontSize: 16, marginTop: 4, fontWeight: '500' },
    relapseLocation: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 2 },
    relapseNote: { color: theme.colors.textSecondary, marginTop: 6, fontStyle: 'italic' },
    emptyText: { color: theme.colors.textTertiary, textAlign: 'center', marginTop: 50 },

    // New Insights Styles
    insightCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
    },
    insightTitle: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    insightBigNumber: {
        color: theme.colors.text,
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    insightLabel: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    insightText: {
        color: theme.colors.text,
        fontSize: 15,
    },
    insightCount: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});