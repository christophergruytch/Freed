import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { theme } from '../theme';

export default function SettingsScreen({
    freedomStartDate,
    setFreedomStartDate,
    isFaithBased,
    setIsFaithBased
}) {
    const [nickname, setNickname] = useState('');

    const saveNickname = () => {
        if (nickname.trim() === '') {
            Alert.alert("Nickname Required", "Please choose a nickname.");
            return;
        }
        Alert.alert("Saved!", `Welcome, ${nickname}!`);
    };

    const resetTimer = () => {
        Alert.alert(
            "Reset Freedom Timer",
            "This will reset your current timer. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset Timer",
                    style: "destructive",
                    onPress: () => {
                        setFreedomStartDate(null);
                        Alert.alert("Timer Reset", "You can start a new freedom period anytime.");
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>⚙️ Settings</Text>

            <Text style={styles.sectionTitle}>Your Private Space</Text>

            <TextInput
                style={styles.input}
                placeholder="Choose a nickname"
                value={nickname}
                onChangeText={setNickname}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveNickname}>
                <Text style={styles.buttonText}>Save Nickname</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Timer Controls</Text>

            <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                <Text style={styles.resetButtonText}>Reset Freedom Timer</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Content Preferences</Text>

            <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Faith-Based Encouragement</Text>
                <Switch
                    value={isFaithBased}
                    onValueChange={setIsFaithBased}
                    trackColor={{ false: '#767577', true: theme.colors.primary }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.padding,
    },
    title: {
        ...theme.fonts.title,
        color: theme.colors.text,
        marginTop: 50,
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        color: theme.colors.text,
        marginTop: 25,
        marginBottom: 12,
    },
    input: {
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        padding: 15,
        borderRadius: theme.spacing.radius,
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        marginBottom: 30,
    },
    resetButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: theme.spacing.radius,
        marginBottom: 15,
    },
    toggleLabel: {
        color: theme.colors.text,
        fontSize: 16,
    },
});