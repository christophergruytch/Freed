// pages/ProgressScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Keyboard } from 'react-native';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function ProgressScreen() {
    const { streak, freedomStartDate } = useStore();

    // Calculate days free from the start date
    const calculateDaysFree = () => {
        if (!freedomStartDate) return 0;
        const now = new Date();
        const start = new Date(freedomStartDate);
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    };

    const daysFree = calculateDaysFree();
    // TODO: Later we'll calculate real longest streak from history

    return (
        <View 
            style={styles.container} 
            onTouchStart={() => Keyboard.dismiss()}
        >
            <ScreenContainer backgroundColor={theme.colors.background}>
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
                        <Text style={styles.statNumber}>21</Text>
                        <Text style={styles.statLabel}>Longest Streak</Text>
                    </View>

                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Journal Entries</Text>
                    </View>
                </View>

                <Text style={styles.motivation}>
                    You're making real progress. Every day you choose freedom matters.
                </Text>
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