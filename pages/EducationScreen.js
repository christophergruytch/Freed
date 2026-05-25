import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function EducationScreen() {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Understanding the Trap</Text>

            <Text style={styles.sectionTitle}>How Porn Addiction Develops</Text>
            <Text style={styles.bodyText}>
                Porn addiction often starts from curiosity and slowly rewires the brain's reward system...
            </Text>

            <Text style={styles.sectionTitle}>The Path to Freedom</Text>
            <Text style={styles.bodyText}>
                Most people who succeed don't do it perfectly — they focus on progress, not perfection...
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
    sectionTitle: {
        fontSize: 22,
        color: '#4CAF50',
        marginTop: 25,
        marginBottom: 10,
    },
    bodyText: {
        color: '#cccccc',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    motivation: {
        color: '#aaaaaa',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
        fontStyle: 'italic',
    },
});