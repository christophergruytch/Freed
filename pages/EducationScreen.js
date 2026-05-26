import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';

export default function EducationScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Understanding the Trap</Text>

            <Text style={styles.sectionTitle}>How Porn Addiction Develops</Text>
            <Text style={styles.bodyText}>
                It often starts from curiosity or stress relief and slowly rewires the brain's reward system. Over time, it can affect focus, relationships, and self-worth.
            </Text>

            <Text style={styles.sectionTitle}>The Path to Freedom</Text>
            <Text style={styles.bodyText}>
                Most people who succeed focus on progress, not perfection. They build new habits, understand their triggers, and are kind to themselves when they slip.
            </Text>

            <Text style={styles.motivation}>
                You are not alone. Recovery is possible. One day at a time.
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
    sectionTitle: {
        fontSize: 22,
        color: theme.colors.primary,
        marginTop: 25,
        marginBottom: 10,
    },
    bodyText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 18,
        marginTop: 40,
        fontStyle: 'italic',
    },
});