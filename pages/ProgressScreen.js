import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ProgressScreen() {
    // now we will use placeholder numbers
    // later we will connect actual data
    const currentStreak = 7;
    const daysFree = 14;
    const longestStreak = 21;
    const totalEntries = 12;


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Your Progress</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{currentStreak}</Text>
                    <Text style={styles.statLabel}>Current Streak</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{daysFree}</Text>
                    <Text style={styles.statLabel}>Days Free</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{longestStreak}</Text>
                    <Text style={styles.statLabel}>Longest Streak</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{totalEntries}</Text>
                    <Text style={styles.statLabel}>Total Journal Entries</Text>
                </View>
            </View>

            <Text style={styles.motivation}>
                You're making progress. Every day and every moment you choose to fight back matters.
            </Text>
        </ScrollView>
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
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 30,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statBox: {
        backgroundColor: '#1a1a1a',
        width: '48%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    statLabel: {
        color: '#aaaaaa',
        marginTop: 8,
        textAlign: 'center',
    },
    motivation: {
        color: '#aaaaaa',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 40,
        fontStyle: 'italic',
    },
});