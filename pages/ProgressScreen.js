import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';

export default function ProgressScreen({ streak, freedomStartDate }) {
    // Calculate days free from the start date
    const calculateDaysFree = () => {
        if (!freedomStartDate) return 0;
        const now = new Date();
        const start = new Date(freedomStartDate);
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    };

    const daysFree = calculateDaysFree();
    const longestStreak = 21;
    const totalEntries = 12;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>📊 Your Progress</Text>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statNumber}>{streak}</Text>
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
                    <Text style={styles.statLabel}>Journal Entries</Text>
                </View>
            </View>

            <Text style={styles.motivation}>
                You're making real progress. Every day you choose freedom matters.
            </Text>
        </ScrollView>
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
        backgroundColor: theme.colors.card,
        width: '48%',
        padding: 20,
        borderRadius: theme.spacing.radius,
        marginBottom: 16,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    statLabel: {
        color: theme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 16,
        marginTop: 40,
        fontStyle: 'italic',
    },
});