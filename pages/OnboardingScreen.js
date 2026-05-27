import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { theme } from '../theme';
import useStore from '../store/useStore';

export default function OnboardingScreen() {
    const { setIsFaithBased, setHasCompletedOnboarding } = useStore();
    const [isFaithBased, setIsFaithBasedLocal] = useState(true);

    const handleGetStarted = () => {
        setIsFaithBased(isFaithBased);
        setHasCompletedOnboarding(true);
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.title}>Welcome to Free'd</Text>
            
            <Text style={styles.subtitle}>
                A space built for real freedom — no paywalls, no judgment, just support.
            </Text>

            <View style={styles.section}>
                <Text style={styles.sectionText}>
                    We believe everyone deserves access to tools that help them fight addiction 
                    without being hit with a payment screen the moment they open the app.
                </Text>
                
                <Text style={styles.sectionText}>
                    This app is free. The core features — tracking, journaling, insights, 
                    and encouragement — will always be free.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Choose Your Experience</Text>
                <Text style={styles.sectionText}>
                    Would you like faith-based encouragement throughout the app?
                </Text>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>
                        {isFaithBased ? 'Faith-Based Encouragement' : 'Neutral Encouragement'}
                    </Text>
                    <Switch
                        value={isFaithBased}
                        onValueChange={setIsFaithBasedLocal}
                        trackColor={{ false: '#767577', true: theme.colors.primary }}
                    />
                </View>
                
                <Text style={styles.note}>
                    You can change this anytime in Settings.
                </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
                You're not alone in this. Let's take it one day at a time.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        padding: theme.spacing.padding,
        paddingTop: 80,
        paddingBottom: 60,
    },
    title: {
        ...theme.fonts.title,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        ...theme.fonts.subtitle,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: 12,
    },
    sectionText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginTop: 12,
    },
    toggleLabel: {
        color: theme.colors.text,
        fontSize: 16,
        flex: 1,
        marginRight: 12,
    },
    note: {
        color: theme.colors.textTertiary,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: 18,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 40,
        fontStyle: 'italic',
        fontSize: 15,
    },
});