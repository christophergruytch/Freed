import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';

export default function JournalScreen() {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState('');

    const addEntry = () => {
        if (newEntry.trim() === '') {
            Alert.alert("Empty Entry", "Please write something before saving.");
            return;
        }

        const entry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            text: newEntry.trim()
        };

        setEntries([entry, ...entries]); // Add to top
        setNewEntry('');

        Alert.alert("Entry Saved", "Your thoughts have been recorded.");
    };

    const deleteEntry = (id) => {
        Alert.alert(
            "Delete Entry",
            "Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => setEntries(entries.filter(entry => entry.id !== id))
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📓 Journal</Text>
            <Text style={styles.subtitle}>Write what's on your mind</Text>

            {/* New Entry Input */}
            <TextInput
                style={styles.input}
                placeholder="What's on your mind today?"
                value={newEntry}
                onChangeText={setNewEntry}
                multiline
            />

            <TouchableOpacity style={styles.saveButton} onPress={addEntry}>
                <Text style={styles.saveButtonText}>💾 Save Entry</Text>
            </TouchableOpacity>

            {/* List of Entries */}
            <Text style={styles.entriesTitle}>Your Entries</Text>

            <FlatList
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.entryItem}>
                        <Text style={styles.entryDate}>{item.date}</Text>
                        <Text style={styles.entryText}>{item.text}</Text>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => deleteEntry(item.id)}
                        >
                            <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No entries yet. Start writing above.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f0f0f',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 50,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaaaaa',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#1f1f1f',
        color: '#ffffff',
        padding: 15,
        borderRadius: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 25,
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    entriesTitle: {
        fontSize: 20,
        color: '#ffffff',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    entryItem: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
    },
    entryDate: {
        color: '#4CAF50',
        fontSize: 14,
        marginBottom: 6,
    },
    entryText: {
        color: '#ffffff',
        fontSize: 16,
        lineHeight: 22,
    },
    deleteButton: {
        position: 'absolute',
        right: 15,
        top: 15,
    },
    deleteButtonText: {
        fontSize: 20,
    },
    emptyText: {
        color: '#666666',
        textAlign: 'center',
        marginTop: 40,
    },
});