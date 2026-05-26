import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme';

export default function CheckInScreen({ streak, setStreak }) {
    const handleCheckIn = () => {
        const newStreak = streak + 1;
        setStreak(newStreak);

        Alert.alert(
            "You're Doing It!",
            `Streak increased to ${newStreak} days!\n\nKeep choosing freedom.`
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Daily Check-In</Text>
            <Text style={styles.subtitle}>Did you choose freedom today?</Text>

            <TouchableOpacity style={styles.checkinButton} onPress={handleCheckIn}>
                <Text style={styles.buttonText}>✅ I Chose Freedom Today</Text>
            </TouchableOpacity>

            <Text style={styles.currentStreak}>Current Streak: {streak} days</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.padding,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        ...theme.fonts.title,
        color: theme.colors.text,
        marginBottom: 10,
    },
    subtitle: {
        ...theme.fonts.subtitle,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    checkinButton: {
        backgroundColor: theme.colors.primary,
        padding: 20,
        borderRadius: theme.spacing.radius,
        width: '90%',
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    currentStreak: {
        fontSize: 20,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});