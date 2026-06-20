// pages/HomeScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing as ReanimatedEasing,
  interpolateColor,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import useStore from '../store/useStore';
import faithEncouragements from '../data/faithEncouragements';
import neutralEncouragements from '../data/neutralEncouragements';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';

export default function HomeScreen({ onOpenTemptation, onOpenProfile }) {
    const insets = useSafeAreaInsets();

    const {
        freedomStartDate,
        setFreedomStartDate,
        relapseHistory,
        setRelapseHistory,
        addRelapse,
        isFaithBased,
        nickname,
    } = useStore();

    // Reanimated shared values for timer breathing + border pulse (re-added for the time free timer as requested)
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);
    const borderProgress = useSharedValue(0);

    const timerScaleStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    const timerBorderStyle = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            borderProgress.value,
            [0, 1],
            ['#2e7d32', '#66bb6a']
        ),
        borderWidth: 2,
    }));

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showRelapseForm, setShowRelapseForm] = useState(false);
    const [motivationalMessage, setMotivationalMessage] = useState("");

    // Ref to track the currently displayed quote so the rotator can guarantee a *different* one
    const currentQuoteRef = useRef("");

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

    // Helper for profile avatar initials
    const getInitials = (name) => {
        if (!name || !name.trim()) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    };

    // Pick a random motivational quote, but *never* the same one as currently showing
    // (when the active list has more than one entry). The ref is updated here so
    // the 30s rotator and initial picks always feel fresh.
    const pickRandomQuote = () => {
        const messages = isFaithBased ? faithEncouragements : neutralEncouragements;
        let pool = messages;
        if (currentQuoteRef.current && messages.length > 1) {
            pool = messages.filter((m) => m !== currentQuoteRef.current);
        }
        const randomIndex = Math.floor(Math.random() * pool.length);
        const chosen = pool[randomIndex];
        currentQuoteRef.current = chosen;
        return chosen;
    };

    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const changeToNewQuote = useCallback(() => {
        if (!mountedRef.current) return;
        const newQuote = pickRandomQuote();
        setMotivationalMessage(newQuote);
    }, [isFaithBased]);

    useEffect(() => {
        // Fresh quote on every mount / app open experience + faith toggle.
        // pickRandomQuote() will set the ref internally.
        const fresh = pickRandomQuote();
        setMotivationalMessage(fresh);
    }, [isFaithBased]);

    // Quote updates every 30s (no cross-fade animation to keep things clean and avoid past Reanimated issues)
    useEffect(() => {
        const interval = setInterval(() => {
            if (mountedRef.current) {
                changeToNewQuote();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [changeToNewQuote]);

    // Live Timer + Reanimated breathing animation for the time free timer
    useEffect(() => {
        if (!freedomStartDate) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            cancelAnimation(scale);
            cancelAnimation(opacity);
            cancelAnimation(borderProgress);
            scale.value = 1;
            opacity.value = 1;
            borderProgress.value = 0;
            return;
        }

        // Breathing + border pulse
        scale.value = withRepeat(
            withSequence(
                withTiming(1.055, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
                withTiming(1, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
            ),
            -1,
            false
        );
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.78, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
                withTiming(1, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
            ),
            -1,
            false
        );
        borderProgress.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) }),
                withTiming(0, { duration: 2600, easing: ReanimatedEasing.inOut(ReanimatedEasing.ease) })
            ),
            -1,
            false
        );

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

        return () => {
            clearInterval(interval);
            cancelAnimation(scale);
            cancelAnimation(opacity);
            cancelAnimation(borderProgress);
        };
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

    const handleFacingTemptation = () => {
        // This will be provided by parent (App.js) to show the overlay screen
        if (typeof onOpenTemptation === 'function') {
            onOpenTemptation();
        } else {
            Alert.alert("Facing Temptation", "This feature opens a guided reflection screen to help you pause and choose freedom.");
        }
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

    // Simple pill (animation removed to eliminate potential source of Reanimated frozen ref errors)
    const OptionPill = ({ label, selected, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View
                style={[
                    styles.optionPill,
                    selected && styles.optionPillSelected,
                ]}
            >
                <Text
                    style={[
                        styles.optionText,
                        selected && styles.optionTextSelected,
                    ]}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScreenContainer 
                scrollable={true} 
                backgroundColor={theme.colors.background}
                contentContainerStyle={{ paddingBottom: 140 }}
            >
                <View style={{ width: '100%', alignItems: 'center', position: 'relative' }}>
                    {/* Profile avatar - replaces the previous settings gear */}
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            top: 50,
                            left: 16,
                            padding: 4,
                            zIndex: 10
                        }}
                        onPress={onOpenProfile}
                    >
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: theme.colors.primary,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {nickname?.trim() ? (
                                <Text style={{
                                    color: '#fff',
                                    fontSize: 17,
                                    fontWeight: '600',
                                }}>
                                    {getInitials(nickname)}
                                </Text>
                            ) : (
                                <Feather name="user" size={20} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>

                    <Text style={styles.title}>Free'd</Text>

                    <Text style={styles.subtitle}>Built for Hope.</Text>

                    <Animated.View style={[styles.timerContainer, timerBorderStyle]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <Feather name="clock" size={18} color={theme.colors.textTertiary} />
                            <Text style={[styles.timerLabel, { marginLeft: 6, marginBottom: 0 }]}>TIME FREE</Text>
                        </View>
                        <Animated.View style={[styles.timerInner, timerScaleStyle]}>
                            <Text style={styles.timerDays}>{timeLeft.days}d</Text>
                            <Text style={styles.timerValue}>
                                {String(timeLeft.hours).padStart(2, '0')}:
                                {String(timeLeft.minutes).padStart(2, '0')}:
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </Text>
                        </Animated.View>
                    </Animated.View>

                    {/* Small personal greeting (if user set a nickname in Settings) */}
                    {nickname ? (
                        <Text style={styles.greeting}>Hey {nickname},</Text>
                    ) : null}

                    <Text style={styles.motivation}>{motivationalMessage}</Text>
                </View>
            </ScreenContainer>

            {!showRelapseForm && (
                <View style={[styles.bottomButtons, { bottom: insets.bottom + 10 }]}>
                    {freedomStartDate === null ? (
                        <Button
                            title="Start Freedom Timer"
                            onPress={startNewFreedom}
                            variant="primary"
                            size="large"
                            style={{ width: '90%' }}
                        />
                    ) : (
                        <View style={styles.buttonRow}>
                            <Button
                                title="I Got Caught"
                                onPress={handleRelapse}
                                variant="danger"
                                size="large"
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title="Facing Temptation"
                                onPress={handleFacingTemptation}
                                variant="accent"
                                size="large"
                                style={{ flex: 1, marginLeft: 8 }}
                            />
                        </View>
                    )}
                </View>
            )}

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
                                <OptionPill
                                    key={option}
                                    label={option}
                                    selected={selectedTriggerApp === option}
                                    onPress={() => setSelectedTriggerApp(option)}
                                />
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
                            contextMenuHidden={false}
                        />

                        {/* Location / Context */}
                        <Text style={styles.formLabel}>Where were you?</Text>
                        <View style={styles.optionsRow}>
                            {locationOptions.map((option) => (
                                <OptionPill
                                    key={option}
                                    label={option}
                                    selected={selectedLocation === option}
                                    onPress={() => setSelectedLocation(option)}
                                />
                            ))}
                        </View>

                        {/* When did this happen? */}
                        <Text style={styles.formLabel}>When did this happen?</Text>
                        <View style={styles.optionsRow}>
                            {timeOptions.map((option) => (
                                <OptionPill
                                    key={option.label}
                                    label={option.label}
                                    selected={false}
                                    onPress={() => setRelapseTimeOffset(option.hoursAgo)}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.customTimeButton}
                            onPress={openDatePicker}
                            activeOpacity={0.8}
                        >
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
                            activeOpacity={0.85}
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
                                        activeOpacity={0.8}
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
                                        activeOpacity={0.8}
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
                            contextMenuHidden={false}
                        />

                        <View style={styles.buttonRow}>
                            <Button
                                title="Log & Reset Timer"
                                onPress={confirmRelapse}
                                variant="danger"
                                size="medium"
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title="Cancel"
                                onPress={cancelRelapse}
                                variant="secondary"
                                size="medium"
                                style={{ flex: 1 }}
                            />
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
    title: { 
        ...theme.fonts.title, 
        color: theme.colors.text, 
        textAlign: 'center', 
        marginTop: 50,
        fontFamily: 'Georgia',
        fontStyle: 'italic',
        fontWeight: 'normal',
    },
    subtitle: { ...theme.fonts.subtitle, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 12 },
    timerContainer: {
        backgroundColor: theme.colors.card,
        paddingVertical: 20,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 24,
        width: '90%',
        borderWidth: 1.5,
        borderColor: '#2e7d32',
    },
    timerInner: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerLabel: { color: theme.colors.textTertiary, fontSize: 18, marginBottom: 10 },
    timerValue: { color: theme.colors.primary, fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
    timerDays: {
        color: theme.colors.primary,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 4,
    },
    startButton: { backgroundColor: theme.colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: theme.spacing.radius, width: '90%', alignItems: 'center', justifyContent: 'center' },
    relapseButton: {
        backgroundColor: theme.colors.danger,
        padding: 14,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#c62828',
    },
    buttonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    relapseButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    facingButton: {
        backgroundColor: theme.colors.accent,
        padding: 14,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: theme.colors.accent,
    },
    facingButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, width: '100%' },
    bottomButtons: {
      position: 'absolute',
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    confirmButton: { backgroundColor: theme.colors.danger, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, width: '48%', alignItems: 'center', justifyContent: 'center' },
    cancelButton: { backgroundColor: '#555', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, width: '48%', alignItems: 'center', justifyContent: 'center' },
    cancelButtonText: { color: '#ffffff', fontWeight: 'bold' },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 17,
        marginTop: 8,
        marginBottom: 28,
        fontStyle: 'italic',
        paddingHorizontal: 24,
        lineHeight: 26,
    },
    greeting: {
        color: theme.colors.primary,
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
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