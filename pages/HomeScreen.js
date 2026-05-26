import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { theme } from '../theme';

const faithMessages = [
    "God is with you in this battle. You are not alone.",
    "His strength is made perfect in your weakness.",
    "Every day you choose freedom is a step toward redemption.",
    "The Lord is fighting for you. Be still.",
    "You are fearfully and wonderfully made.",
    "Grace upon grace — keep going.",
];

const neutralMessages = [
    "One day at a time. You're getting Free'd.",
    "Progress over perfection. Keep going.",
    "You are stronger than the trap.",
    "Every small choice matters.",
    "Freedom is worth the fight.",
    "You've come this far. Don't stop now.",
];

export default function HomeScreen({
    freedomStartDate,
    setFreedomStartDate,
    relapseHistory,
    setRelapseHistory,
    isFaithBased
}) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showRelapseNote, setShowRelapseNote] = useState(false);
    const [relapseNote, setRelapseNote] = useState('');
    const [motivationalMessage, setMotivationalMessage] = useState("");

    // Select random motivational message when faith toggle changes
    useEffect(() => {
        const messages = isFaithBased ? faithMessages : neutralMessages;
        const randomIndex = Math.floor(Math.random() * messages.length);
        setMotivationalMessage(messages[randomIndex]);
    }, [isFaithBased]);

    // Live Timer
    useEffect(() => {
        if (!freedomStartDate) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            return;
        }

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(freedomStartDate);
            const diff = Math.floor((now - start) / 1000);

            const days = Math.floor(diff / (24 * 60 * 60));
            const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((diff % (60 * 60)) / 60);
            const seconds = diff % 60;

            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);

        return () => clearInterval(interval);
    }, [freedomStartDate]);

    const startNewFreedom = () => {
        const today = new Date();
        setFreedomStartDate(today);
        Alert.alert("Freedom Timer Started", "You're officially on your way to being Free'd!");
    };

    const handleRelapse = () => {
        setShowRelapseNote(true);
        setRelapseNote('');
    };

    const confirmRelapse = () => {
        const now = new Date();
        const newRelapse = {
            id: Date.now().toString(),
            date: now.toLocaleString(),
            note: relapseNote.trim() || "No note provided"
        };

        setRelapseHistory(prev => [newRelapse, ...prev]);

        setFreedomStartDate(now);
        setShowRelapseNote(false);
        setRelapseNote('');

        Alert.alert("Relapse Logged", "Timer has been reset. A new day begins.");
    };

    const cancelRelapse = () => {
        setShowRelapseNote(false);
        setRelapseNote('');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.dismissArea} onPress={Keyboard.dismiss} activeOpacity={1} />

            <Text style={styles.title}>Free'd</Text>
            <Text style={styles.subtitle}>Built for Hope.</Text>

            <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>TIME FREE</Text>
                <Text style={styles.timerValue}>
                    {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}:
                    {String(timeLeft.minutes).padStart(2, '0')}:
                    {String(timeLeft.seconds).padStart(2, '0')}
                </Text>
            </View>

            <Text style={styles.motivation}>{motivationalMessage}</Text>

            {freedomStartDate === null ? (
                <TouchableOpacity style={styles.startButton} onPress={startNewFreedom}>
                    <Text style={styles.buttonText}>Start Freedom Timer</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.relapseButton} onPress={handleRelapse}>
                    <Text style={styles.relapseButtonText}>I Got Caught in the Trap</Text>
                </TouchableOpacity>
            )}

            {showRelapseNote && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.noteContainer}
                >
                    <Text style={styles.noteTitle}>Log this relapse (optional)</Text>
                    <TextInput
                        style={styles.noteInput}
                        placeholder="What triggered this?"
                        value={relapseNote}
                        onChangeText={setRelapseNote}
                        multiline
                    />
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.confirmButton} onPress={confirmRelapse}>
                            <Text style={styles.buttonText}>Log & Reset</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={cancelRelapse}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.padding, alignItems: 'center' },
    dismissArea: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: -1 },
    title: { ...theme.fonts.title, color: theme.colors.text, textAlign: 'center', marginTop: 60 },
    subtitle: { ...theme.fonts.subtitle, color: theme.colors.textSecondary, textAlign: 'center', marginVertical: 12 },
    timerContainer: { backgroundColor: theme.colors.card, padding: 40, borderRadius: 25, alignItems: 'center', marginVertical: 40, width: '90%' },
    timerLabel: { color: theme.colors.textTertiary, fontSize: 18, marginBottom: 10 },
    timerValue: { color: theme.colors.primary, fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
    startButton: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.spacing.radius, width: '90%', alignItems: 'center' },
    relapseButton: { backgroundColor: theme.colors.danger, padding: 18, borderRadius: theme.spacing.radius, width: '90%', alignItems: 'center' },
    buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    relapseButtonText: { color: '#ffffff', fontWeight: 'bold' },
    noteContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: theme.colors.card, padding: 20, borderRadius: 16 },
    noteTitle: { color: theme.colors.text, fontSize: 16, marginBottom: 10, textAlign: 'center' },
    noteInput: { backgroundColor: '#1f1f1f', color: theme.colors.text, padding: 15, borderRadius: 12, minHeight: 80, marginBottom: 15, textAlignVertical: 'top' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
    confirmButton: { backgroundColor: theme.colors.danger, padding: 14, borderRadius: 12, width: '48%', alignItems: 'center' },
    cancelButton: { backgroundColor: '#555', padding: 14, borderRadius: 12, width: '48%', alignItems: 'center' },
    cancelButtonText: { color: '#ffffff', fontWeight: 'bold' },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 17,
        marginTop: 30,
        fontStyle: 'italic',
        paddingHorizontal: 20,
        lineHeight: 24,
    },
});