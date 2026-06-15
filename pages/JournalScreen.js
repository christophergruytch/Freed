// pages/JournalScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { theme } from '../theme';
import ScreenContainer from '../components/ScreenContainer';
import useStore from '../store/useStore';
import Button from '../components/Button';

export default function JournalScreen() {
    const {
        journalEntries,
        addJournalEntry: addToStore,
        updateJournalEntry,
        deleteJournalEntry: deleteFromStore,
    } = useStore();

    const [newEntry, setNewEntry] = useState('');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editText, setEditText] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const QUICK_PROMPTS = [
        "What am I grateful for today?",
        "What triggered me recently and how did I respond?",
        "One win I'm proud of this week...",
        "How has my perspective on freedom changed?",
        "What would I tell someone else in my shoes?",
    ];

    const addJournalEntry = () => {
        if (newEntry.trim() === '') return;
        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            text: newEntry.trim(),
        };
        addToStore(entry);
        setNewEntry('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 1200);
    };

    const startEditing = (index) => {
        setEditingIndex(index);
        setEditText(journalEntries[index].text);
    };

    const saveEdit = () => {
        if (editText.trim() === '') return;
        const entry = journalEntries[editingIndex];
        updateJournalEntry(entry.id, {
            text: editText.trim(),
            date: new Date().toLocaleDateString(),
        });
        setEditingIndex(null);
        setEditText('');
        Alert.alert("Updated", "Journal entry has been updated.");
    };

    const deleteJournalEntry = (id) => {
        deleteFromStore(id);
    };

    const useQuickPrompt = (prompt) => {
        setNewEntry(prompt + ' ');
    };

    return (
        <View style={styles.container}>
            <ScreenContainer
                backgroundColor={theme.colors.background}
                keyboardDismissMode="on-drag"
            >
                <Text style={styles.title}>Journal</Text>
                <Text style={styles.subtitle}>
                    Your private space to process thoughts, note wins, and track growth. Every entry builds self-awareness.
                </Text>

                {/* Quick prompts for value */}
                <Text style={styles.promptLabel}>Quick start prompts:</Text>
                <View style={styles.promptsRow}>
                    {QUICK_PROMPTS.map((prompt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.promptChip}
                            onPress={() => useQuickPrompt(prompt)}
                        >
                            <Text style={styles.promptChipText}>{prompt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind today?"
                    value={newEntry}
                    onChangeText={setNewEntry}
                    multiline
                    contextMenuHidden={false}
                />
                <Button
                    title="💾 Save Entry"
                    onPress={addJournalEntry}
                    variant="primary"
                    size="medium"
                    success={saveSuccess}
                    style={{ marginBottom: 16 }}
                />

                {/* Past entries */}
                {journalEntries.length > 0 ? (
                    journalEntries.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={1}
                            onPress={() => Keyboard.dismiss()}
                            style={styles.entryItem}
                        >
                            <Text style={styles.entryDate}>{item.date}</Text>
                            {editingIndex === index ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={editText}
                                    onChangeText={setEditText}
                                    multiline
                                    contextMenuHidden={false}
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
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Your journal is a powerful tool for freedom.</Text>
                        <Text style={styles.emptySubtext}>
                            Writing helps process emotions, celebrate progress, and spot patterns over time. 
                            Start small — even one sentence matters.
                        </Text>
                    </View>
                )}

                {/* Large tappable background area at bottom — tap here to dismiss keyboard */}
                <TouchableOpacity
                    activeOpacity={1}
                    style={{ height: 320 }}
                    onPress={Keyboard.dismiss}
                />
            </ScreenContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.padding },
    title: { ...theme.fonts.title, color: theme.colors.text, marginTop: 50, marginBottom: 6, textAlign: 'center' },
    subtitle: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        paddingHorizontal: 10,
        lineHeight: 18,
    },
    promptLabel: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 6,
        marginLeft: 4,
    },
    promptsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    promptChip: {
        backgroundColor: theme.colors.card,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    promptChipText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    input: { backgroundColor: theme.colors.card, color: theme.colors.text, padding: 15, borderRadius: 12, minHeight: 80, marginBottom: 8 },
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
    emptyContainer: {
        alignItems: 'center',
        marginTop: 30,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: theme.colors.text,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
});