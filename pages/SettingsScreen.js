import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';

export default function SettingsScreen() {
    const [nickname, setNickname] = useState('');
    const [isFaithBased, setIsFaithBased] = useState(true);

    const saveNickname = () => {
        if (nickname.trim() === '') {
            Alert.alert("Nickname Required", "Please choose a nickname.");
            return;
        }
        Alert.alert("Saved!", `Welcome, ${nickname}! Your data is now private to you.`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ Settings</Text>

            <Text style={styles.sectionTitle}>Your Private Space</Text>

            <TextInput
                style={styles.input}
                placeholder="Choose a nickname (e.g. john_doe)"
                value={nickname}
                onChangeText={setNickname}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveNickname}>
                <Text style={styles.buttonText}>Save Nickname</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Content Preferences</Text>

            <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Faith-Based Encouragement</Text>
                <Switch
                    value={isFaithBased}
                    onValueChange={setIsFaithBased}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                />
            </View>

            <Text style={styles.infoText}>
                This app is built to support both faith-based and neutral journeys.
            </Text>
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
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#ffffff',
        marginTop: 25,
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#1f1f1f',
        color: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
    },
    toggleLabel: {
        color: '#ffffff',
        fontSize: 16,
    },
    infoText: {
        color: '#aaaaaa',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
    },
});