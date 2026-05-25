import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function CheckInScreen() {
    const [streak, setStreak] = useState(7);
    const [lastCheckIn, setLastCheckIn] = useState(new Date().toDateString());

    const handleCheckIn = () => {
        const today = new Date().toDateString();

        if (lastCheckIn === today) {
            Alert.alert("Already Checked In", "You've already checked in today. Great job staying consistent!");
            return;
        }

        const newStreak = streak + 1;
        setStreak(newStreak);
        setLastCheckIn(today);

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
        backgroundColor: '#0f0f0f',
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#aaaaaa',
        textAlign: 'center',
        marginBottom: 40,
    },
    checkinButton: {
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 16,
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
        color: '#4CAF50',
        fontWeight: 'bold',
    },
});