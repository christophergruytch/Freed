import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../theme';   // Import the theme

export default function HomeScreen() {
    const [streak, setStreak] = useState(7);
    const [daysFree, setDaysFree] = useState(14);

    const handleCheckIn = () => {
        setStreak(streak + 1);
        Alert.alert("Great job!", `Streak increased to ${streak + 1} days!`);
    };

    const handleRelapse = () => {
        Alert.alert("It's okay", "Tomorrow is a new chance to choose freedom.");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Free'd</Text>
            <Text style={styles.subtitle}>Getting free from the trap, one day at a time.</Text>

            <View style={styles.metricsContainer}>
                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Current Streak</Text>
                    <Text style={styles.metricValue}>{streak}</Text>
                    <Text style={styles.metricUnit}>days</Text>
                </View>

                <View style={styles.metricBox}>
                    <Text style={styles.metricLabel}>Days Free</Text>
                    <Text style={styles.metricValue}>{daysFree}</Text>
                    <Text style={styles.metricUnit}>days</Text>
                </View>
            </View>

            <TouchableOpacity style={styles.checkinButton} onPress={handleCheckIn}>
                <Text style={styles.buttonText}>✅ Check In Today</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.relapseButton} onPress={handleRelapse}>
                <Text style={styles.relapseButtonText}>I Got Caught in the Trap</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.padding,
        alignItems: 'center',
    },
    title: {
        ...theme.fonts.title,
        color: theme.colors.text,
        textAlign: 'center',
        marginTop: 60,
    },
    subtitle: {
        ...theme.fonts.subtitle,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginVertical: 12,
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginVertical: 30,
    },
    metricBox: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: theme.spacing.radius,
        width: '48%',
        alignItems: 'center',
    },
    metricLabel: {
        color: theme.colors.textTertiary,
        fontSize: 14,
    },
    metricValue: {
        color: theme.colors.text,
        fontSize: 42,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    metricUnit: {
        color: theme.colors.textTertiary,
        fontSize: 14,
    },
    checkinButton: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: theme.spacing.radius,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    relapseButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: theme.spacing.radius,
        width: '100%',
        alignItems: 'center',
        marginTop: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    relapseButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});