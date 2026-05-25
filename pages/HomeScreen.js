import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function HomeScreen() {
    const [streak, setStreak] = useState(7);
    const [daysFree, setDaysFree] = useState(14);
    const [lastCheckInDate, setLastCheckInDate] = useState(new Date().toDateString());

    const handleCheckIn = () => {
        const today = new Date().toDateString();

        if (lastCheckInDate === today) {
            Alert.alert("Already Checked In", "You've already checked in today. Come back tomorrow!");
            return;
        }

        const newStreak = streak + 1;
        setStreak(newStreak);
        setLastCheckInDate(today);

        Alert.alert(
            "Well done!",
            `You've added another day to your streak!\nCurrent streak: ${newStreak} days`,
            [{ text: "Keep Going 💪", style: "default" }]
        );
    };

    const handleRelapse = () => {
        Alert.alert(
            "It's okay",
            "Getting caught in the trap happens.\n\nBe kind to yourself.\nTomorrow is a new chance to choose freedom.",
            [
                {
                    text: "Reset Freedom Timer",
                    onPress: () => {
                        setDaysFree(0);
                        Alert.alert("Timer Reset", "You've got this.");
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Free'd</Text>
            <Text style={styles.subtitle}>Built using Hope, for Hope.</Text>

            {/* Metrics */}
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

            {/* Quick Actions */}
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
        backgroundColor: '#0f0f0f',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 60,
    },
    subtitle: {
        fontSize: 16,
        color: '#aaaaaa',
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
        backgroundColor: '#1a1a1a',
        padding: 20,
        borderRadius: 16,
        width: '48%',
        alignItems: 'center',
    },
    metricLabel: {
        color: '#888888',
        fontSize: 14,
    },
    metricValue: {
        color: '#ffffff',
        fontSize: 42,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    metricUnit: {
        color: '#666666',
        fontSize: 14,
    },
    checkinButton: {
        backgroundColor: '#4CAF50',
        padding: 18,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    relapseButton: {
        backgroundColor: '#d32f2f',
        padding: 16,
        borderRadius: 12,
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