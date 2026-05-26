import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function JournalScreen({ relapseHistory = [] }) {

    const [activeTab, setActiveTab] = useState('journal');
    const [journalEntries, setJournalEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');

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
        <View style={styles.container}>
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
                    <Text style={activeTab === 'relapse' ? styles.activeTabText : styles.tabText}>Relapse History</Text>
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
                    />
                </View>
            ) : (
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Relapse History</Text>
                    <FlatList
                        data={relapseHistory}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.relapseItem}>
                                <Text style={styles.relapseDate}>{item.date}</Text>
                                <Text style={styles.relapseNote}>{item.note}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>No relapses logged yet.</Text>}
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
    relapseNote: { color: theme.colors.text, marginTop: 6 },
    emptyText: { color: theme.colors.textTertiary, textAlign: 'center', marginTop: 50 },
});