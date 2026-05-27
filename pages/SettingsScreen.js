// pages/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, Keyboard } from 'react-native';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function SettingsScreen() {
    const {
        freedomStartDate,
        setFreedomStartDate,
        isFaithBased,
        setIsFaithBased,
        relapseHistory,
        setRelapseHistory,
        hasCompletedOnboarding,
        setHasCompletedOnboarding
    } = useStore();
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

    const clearRelapseHistory = () => {
        const count = relapseHistory.length;

        if (count === 0) {
            Alert.alert("Nothing to Clear", "You have no relapse history to delete.");
            return;
        }

        Alert.alert(
            "Clear All Relapse History?",
            `This will permanently delete all ${count} logged relapse${count === 1 ? '' : 's'}. This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: () => {
                        setRelapseHistory([]);
                        Alert.alert("History Cleared", "All relapse records have been deleted.");
                    }
                }
            ]
        );
    };

    const resetOnboarding = () => {
        Alert.alert(
            "Restart Onboarding?",
            "This will take you back to the welcome screen on next launch. Your data will be kept.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Restart",
                    style: "destructive",
                    onPress: () => {
                        setHasCompletedOnboarding(false);
                        Alert.alert("Onboarding Reset", "The onboarding screen will appear the next time you open the app.");
                    }
                }
            ]
        );
    };

    return (
        <View 
            style={styles.container} 
            onTouchStart={() => Keyboard.dismiss()}
        >
            <ScreenContainer backgroundColor={theme.colors.background}>
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

                <Text style={styles.sectionTitle}>Data Management</Text>

                <View style={styles.dataSection}>
                    <Text style={styles.relapseCount}>
                        {relapseHistory.length} relapse{relapseHistory.length === 1 ? '' : 's'} logged
                    </Text>

                    <TouchableOpacity style={styles.dangerButton} onPress={clearRelapseHistory}>
                        <Text style={styles.dangerButtonText}>Clear Relapse History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.dangerButton, { marginTop: 12, backgroundColor: '#555' }]} 
                        onPress={resetOnboarding}
                    >
                        <Text style={styles.dangerButtonText}>Restart Onboarding</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
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
    dataSection: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    relapseCount: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        marginBottom: 16,
        textAlign: 'center',
    },
    dangerButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});