// pages/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import useStore from '../store/useStore';
import faithEncouragements from '../data/faithEncouragements';
import neutralEncouragements from '../data/neutralEncouragements';
import ScreenContainer from '../components/ScreenContainer';

export default function HomeScreen() {
    const insets = useSafeAreaInsets();

    const {
        freedomStartDate,
        setFreedomStartDate,
        relapseHistory,
        setRelapseHistory,
        addRelapse,
        isFaithBased
    } = useStore();

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showRelapseForm, setShowRelapseForm] = useState(false);
    const [motivationalMessage, setMotivationalMessage] = useState("");

    // Rich relapse form state
    const [selectedTriggerApp, setSelectedTriggerApp] = useState('');
    const [triggerDescription, setTriggerDescription] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [relapseNote, setRelapseNote] = useState('');
    const [relapseTime, setRelapseTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('start'); // 'start' or 'end'
    const [isTimeRange, setIsTimeRange] = useState(false);
    const [timeRangeEnd, setTimeRangeEnd] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000));

    // Options for the rich relapse form
    const triggerOptions = [
        'Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Reddit',
        'Facebook', 'Snapchat', 'Browser', 'Other'
    ];

    const locationOptions = [
        'Home / Bedroom', 'Living Room', 'Bathroom', 'Car / Commute',
        'Work', 'School', 'Gym', 'Other'
    ];

    const timeOptions = [
        { label: 'Just now', hoursAgo: 0 },
        { label: '~1 hour ago', hoursAgo: 1 },
        { label: 'A few hours ago', hoursAgo: 4 },
        { label: 'Yesterday', hoursAgo: 24 },
        { label: '2+ days ago', hoursAgo: 48 },
    ];

    // Motivational message - picks a new random one whenever the faith mode changes
    useEffect(() => {
        const messages = isFaithBased ? faithEncouragements : neutralEncouragements;
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
        // Open the rich relapse form
        setShowRelapseForm(true);
        setSelectedTriggerApp('');
        setTriggerDescription('');
        setSelectedLocation('');
        setRelapseNote('');
        setRelapseTime(new Date());
        setShowDatePicker(false);
        setIsTimeRange(false);
        setTimeRangeEnd(new Date(Date.now() + 2 * 60 * 60 * 1000)); // default 2 hours later
    };

    const confirmRelapse = () => {
        const newRelapse = {
            id: Date.now().toString(),
            timestamp: relapseTime.toISOString(),
            timeRangeEnd: isTimeRange ? timeRangeEnd.toISOString() : undefined,
            triggerApp: selectedTriggerApp || 'Not specified',
            triggerDescription: triggerDescription.trim() || undefined,
            location: selectedLocation || undefined,
            note: relapseNote.trim() || undefined,
        };

        addRelapse(newRelapse);
        setFreedomStartDate(relapseTime);

        // Close form and reset local form state
        setShowRelapseForm(false);
        setSelectedTriggerApp('');
        setTriggerDescription('');
        setSelectedLocation('');
        setRelapseNote('');

        Alert.alert("Relapse Logged", "Timer has been reset. A new day begins.");
    };

    const cancelRelapse = () => {
        setShowRelapseForm(false);
        setSelectedTriggerApp('');
        setTriggerDescription('');
        setSelectedLocation('');
        setRelapseNote('');
    };

    const setRelapseTimeOffset = (hoursAgo) => {
        const newStart = new Date();
        newStart.setHours(newStart.getHours() - hoursAgo);
        setRelapseTime(newStart);

        if (isTimeRange) {
            // Keep roughly the same range width
            const currentWidth = timeRangeEnd.getTime() - relapseTime.getTime();
            const newEnd = new Date(newStart.getTime() + currentWidth);
            setTimeRangeEnd(newEnd);
        }
    };

    const openDatePicker = (mode = 'start') => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    const onDateTimeChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (datePickerMode === 'end') {
                setTimeRangeEnd(selectedDate);
            } else {
                setRelapseTime(selectedDate);
            }
        }
    };

    return (
        <View 
            style={styles.container} 
            onTouchStart={() => Keyboard.dismiss()}
        >
            <ScreenContainer scrollable={true} backgroundColor={theme.colors.background}>
                <View style={{ width: '100%', alignItems: 'center' }}>
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
                    </View>
                </ScreenContainer>

            {showRelapseForm && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={[
                        styles.relapseFormContainer,
                        { bottom: insets.bottom + 70 } // Clear the bottom tab bar + safe area
                    ]}
                >
                    <ScrollView
                        contentContainerStyle={styles.formScrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.formTitle}>Log This Relapse</Text>

                        {/* Trigger App */}
                        <Text style={styles.formLabel}>What app triggered this?</Text>
                        <View style={styles.optionsRow}>
                            {triggerOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionPill,
                                        selectedTriggerApp === option && styles.optionPillSelected
                                    ]}
                                    onPress={() => setSelectedTriggerApp(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedTriggerApp === option && styles.optionTextSelected
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Trigger Description (optional) */}
                        <Text style={styles.formLabel}>More details (optional)</Text>
                        <TextInput
                            style={styles.formInput}
                            placeholder="What specifically happened?"
                            value={triggerDescription}
                            onChangeText={setTriggerDescription}
                            multiline
                        />

                        {/* Location / Context */}
                        <Text style={styles.formLabel}>Where were you?</Text>
                        <View style={styles.optionsRow}>
                            {locationOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.optionPill,
                                        selectedLocation === option && styles.optionPillSelected
                                    ]}
                                    onPress={() => setSelectedLocation(option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selectedLocation === option && styles.optionTextSelected
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* When did this happen? */}
                        <Text style={styles.formLabel}>When did this happen?</Text>
                        <View style={styles.optionsRow}>
                            {timeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.label}
                                    style={styles.optionPill}
                                    onPress={() => setRelapseTimeOffset(option.hoursAgo)}
                                >
                                    <Text style={styles.optionText}>{option.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.customTimeButton} onPress={openDatePicker}>
                            <Text style={styles.customTimeText}>Choose exact date &amp; time...</Text>
                        </TouchableOpacity>

                        <Text style={styles.selectedTimeText}>
                            Selected: {relapseTime.toLocaleString([], { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                            })}
                        </Text>

                        {showDatePicker && (
                            <DateTimePicker
                                value={relapseTime}
                                mode="datetime"
                                display="default"
                                onChange={onDateTimeChange}
                            />
                        )}

                        {/* Time Range Option */}
                        <TouchableOpacity 
                            style={styles.rangeToggle} 
                            onPress={() => setIsTimeRange(!isTimeRange)}
                        >
                            <Text style={styles.rangeToggleText}>
                                {isTimeRange ? '✓ ' : ''}This happened during a time range (e.g. 9–11pm)
                            </Text>
                        </TouchableOpacity>

                        {isTimeRange && (
                            <>
                                <View style={styles.rangeRow}>
                                    <TouchableOpacity 
                                        style={styles.rangeTimeButton} 
                                        onPress={() => openDatePicker('start')}
                                    >
                                        <Text style={styles.rangeTimeLabel}>From</Text>
                                        <Text style={styles.rangeTimeValue}>
                                            {relapseTime.toLocaleString([], { 
                                                hour: 'numeric', 
                                                minute: '2-digit' 
                                            })}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={styles.rangeTimeButton} 
                                        onPress={() => openDatePicker('end')}
                                    >
                                        <Text style={styles.rangeTimeLabel}>To</Text>
                                        <Text style={styles.rangeTimeValue}>
                                            {timeRangeEnd.toLocaleString([], { 
                                                hour: 'numeric', 
                                                minute: '2-digit' 
                                            })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.rangeHint}>
                                    Tap the times above to adjust the range (e.g. 9:00 PM – 11:00 PM)
                                </Text>
                            </>
                        )}

                        {/* Optional longer note */}
                        <Text style={styles.formLabel}>Any other thoughts? (optional)</Text>
                        <TextInput
                            style={[styles.formInput, { minHeight: 70 }]}
                            placeholder="Write anything else you want to remember..."
                            value={relapseNote}
                            onChangeText={setRelapseNote}
                            multiline
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmRelapse}>
                                <Text style={styles.buttonText}>Log & Reset Timer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={cancelRelapse}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Extra space at bottom so last buttons aren't covered */}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.padding, alignItems: 'center' },
    title: { ...theme.fonts.title, color: theme.colors.text, textAlign: 'center', marginTop: 60 },
    subtitle: { ...theme.fonts.subtitle, color: theme.colors.textSecondary, textAlign: 'center', marginVertical: 12 },
    timerContainer: { backgroundColor: theme.colors.card, padding: 40, borderRadius: 25, alignItems: 'center', marginVertical: 40, width: '90%' },
    timerLabel: { color: theme.colors.textTertiary, fontSize: 18, marginBottom: 10 },
    timerValue: { color: theme.colors.primary, fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
    startButton: { backgroundColor: theme.colors.primary, padding: 18, borderRadius: theme.spacing.radius, width: '90%', alignItems: 'center' },
    relapseButton: { backgroundColor: theme.colors.danger, padding: 18, borderRadius: theme.spacing.radius, width: '90%', alignItems: 'center' },
    buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
    relapseButtonText: { color: '#ffffff', fontWeight: 'bold' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    confirmButton: { backgroundColor: theme.colors.danger, padding: 14, borderRadius: 12, width: '48%', alignItems: 'center' },
    cancelButton: { backgroundColor: '#555', padding: 14, borderRadius: 12, width: '48%', alignItems: 'center' },
    cancelButtonText: { color: '#ffffff', fontWeight: 'bold' },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 17,
        marginTop: 16,
        marginBottom: 32,
        fontStyle: 'italic',
        paddingHorizontal: 24,
        lineHeight: 26,
    },
    // Rich Relapse Form Styles
    relapseFormContainer: {
        position: 'absolute',
        left: 16,
        right: 16,
        backgroundColor: theme.colors.card,
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 8,
        borderRadius: 20,
        maxHeight: '72%',
    },
    formScrollContent: {
        paddingBottom: 10,
    },
    formTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 14,
        textAlign: 'center',
    },
    formLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginTop: 10,
        marginBottom: 6,
    },
    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 6,
    },
    optionPill: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    optionPillSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    optionText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    },
    optionTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    formInput: {
        backgroundColor: '#1f1f1f',
        color: theme.colors.text,
        padding: 12,
        borderRadius: 12,
        minHeight: 50,
        marginBottom: 8,
        textAlignVertical: 'top',
    },
    customTimeButton: {
        marginTop: 6,
        marginBottom: 4,
    },
    customTimeText: {
        color: theme.colors.primary,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    selectedTimeText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    rangeToggle: {
        marginTop: 8,
        marginBottom: 4,
    },
    rangeToggleText: {
        color: theme.colors.primary,
        fontSize: 14,
    },
    rangeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 6,
    },
    rangeTimeButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3a3a3a',
    },
    rangeTimeLabel: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginBottom: 2,
    },
    rangeTimeValue: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    rangeHint: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginTop: 6,
        fontStyle: 'italic',
    },
});