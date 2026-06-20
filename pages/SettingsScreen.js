// pages/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';
import Button from '../components/Button';
import {
    scheduleReminders,
    sendTestNotificationIn10Seconds,
    getNotificationPermissionStatus,
    requestNotificationPermissions
} from '../services/notifications';

// Human-friendly 12-hour display (internal storage stays "HH:mm" 24h for reliable scheduling)
const formatTo12Hour = (time24) => {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
};

export default function SettingsScreen({ onClose }) {
    const {
        freedomStartDate,
        setFreedomStartDate,
        isFaithBased,
        setIsFaithBased,
        relapseHistory,
        setRelapseHistory,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        resetActiveDays,
        // Notification settings
        notificationsEnabled = true,
        notificationTime = '20:00',
        customNotificationMessage = '',
        notificationTypes = { daily: true, streak: true, journal: true, motivational: true },
        setNotificationTypes,
        quietHours = { enabled: false, start: '22:00', end: '07:00' },
        setQuietHours,
        setNotificationSettings,
        // Nickname
        nickname: storedNickname = '',
        setNickname: saveNicknameToStore,
    } = useStore();

    const [nickname, setNickname] = useState(storedNickname);

    // Keep local draft in sync if store value changes externally
    useEffect(() => {
        setNickname(storedNickname);
    }, [storedNickname]);

    // Load notification permission status
    useEffect(() => {
        const loadPermissionStatus = async () => {
            const status = await getNotificationPermissionStatus();
            setPermissionStatus(status);
        };
        loadPermissionStatus();
    }, []);

    // Local state for notification settings (applied only on "Apply")
    const [localNotificationTime, setLocalNotificationTime] = useState(notificationTime);
    const [localCustomMessage, setLocalCustomMessage] = useState(customNotificationMessage);
    const [hasUnsavedNotificationChanges, setHasUnsavedNotificationChanges] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState(null);

    // For the time picker (modal presentation for clean native wheel)
    const [showTimePickerModal, setShowTimePickerModal] = useState(false);
    const [pickerDate, setPickerDate] = useState(() => {
        const [h, m] = notificationTime.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        return d;
    });

    const saveNickname = () => {
        if (nickname.trim() === '') {
            Alert.alert("Nickname Required", "Please choose a nickname.");
            return;
        }
        saveNicknameToStore(nickname);
        Alert.alert("Saved!", `Welcome, ${nickname.trim()}! Your greeting will now appear on the Home screen.`);
    };

    const resetTimer = () => {
        Alert.alert(
            "Reset Freedom Timer",
            "This will reset your current timer. Are you sure?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset Timer",
                    style: "destructive",
                    onPress: () => {
                        setFreedomStartDate(null);
                        Alert.alert("Timer Reset", "You can start a new freedom period anytime.");
                    }
                }
            ]
        );
    };

    const clearRelapseHistory = () => {
        const count = relapseHistory.length;

        if (count === 0) {
            Alert.alert("Nothing to Clear", "You have no relapse history to delete.");
            return;
        }

        Alert.alert(
            "Clear All Relapse History?",
            `This will permanently delete all ${count} logged relapse${count === 1 ? '' : 's'}. This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete All",
                    style: "destructive",
                    onPress: () => {
                        setRelapseHistory([]);
                        Alert.alert("History Cleared", "All relapse records have been deleted.");
                    }
                }
            ]
        );
    };

    const resetOnboarding = () => {
        Alert.alert(
            "Restart Onboarding?",
            "This will take you back to the welcome screen on next launch. Your data will be kept.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Restart",
                    style: "destructive",
                    onPress: () => {
                        setHasCompletedOnboarding(false);
                        Alert.alert("Onboarding Reset", "The onboarding screen will appear the next time you open the app.");
                    }
                }
            ]
        );
    };

    const handleResetActiveDays = () => {
        Alert.alert(
            "Reset Active Days?",
            "This will clear your entire check-in history from the calendar. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                        resetActiveDays();
                        Alert.alert("Active Days Reset", "Your check-in calendar has been cleared.");
                    }
                }
            ]
        );
    };

    // Helper to reschedule notification when settings change
    const updateAndRescheduleNotifications = async (newSettings) => {
        setNotificationSettings(newSettings);

        // Always ensure we have permission before scheduling
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            Alert.alert(
                "Permission Required", 
                "Please enable notifications for this app in your device settings."
            );
            return false;
        }

        // Reschedule with latest values
        const latest = useStore.getState();
        
        try {
            await scheduleReminders({
                enabled: latest.notificationsEnabled,
                dailyTime: latest.notificationTime,
                customMessage: latest.customNotificationMessage,
                types: latest.notificationTypes || { daily: true, streak: true, journal: true, motivational: true },
                quietHours: latest.quietHours || { enabled: false, start: '22:00', end: '07:00' },
                relapseHistory: latest.relapseHistory || [],
            });
            return true;
        } catch (error) {
            console.error("Failed to reschedule notifications:", error);
            Alert.alert("Error", "Failed to schedule notifications. Please try again.");
            return false;
        }
    };

    return (
        <View style={styles.container}>
            {/* Fixed header when opened as overlay (from Home) */}
            {onClose && (
                <View style={styles.fixedHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onClose}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>
                </View>
            )}

            <ScreenContainer backgroundColor={theme.colors.background}>
                {!onClose && (
                    <Text style={styles.title}>Settings</Text>
                )}

                <Text style={styles.sectionTitle}>Your Private Space</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Choose a nickname"
                    value={nickname}
                    onChangeText={setNickname}
                    contextMenuHidden={false}
                />

                <Button 
                    title="Save Nickname" 
                    onPress={saveNickname} 
                    variant="primary" 
                    size="medium" 
                />

                <Text style={styles.sectionTitle}>Content Preferences</Text>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Faith-Based Encouragement</Text>
                    <Switch
                        value={isFaithBased}
                        onValueChange={setIsFaithBased}
                        trackColor={{ false: '#767577', true: theme.colors.primary }}
                    />
                </View>

                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.toggleRow}>
                    <Text style={styles.toggleLabel}>Daily Reminder</Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={(enabled) => {
                            setNotificationSettings({ notificationsEnabled: enabled });
                            // Immediately apply enable/disable using the *committed* time/message (not draft locals)
                            scheduleReminders({
                                enabled,
                                dailyTime: notificationTime,
                                customMessage: customNotificationMessage,
                                types: useStore.getState().notificationTypes || { daily: true, streak: true, journal: true, motivational: true },
                                quietHours: useStore.getState().quietHours || { enabled: false, start: '22:00', end: '07:00' },
                                relapseHistory: useStore.getState().relapseHistory || [],
                            });
                        }}
                        trackColor={{ false: '#767577', true: theme.colors.primary }}
                    />
                </View>

                {notificationsEnabled && (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Reminder Time</Text>
                            
                            <TouchableOpacity 
                                style={styles.input} 
                                onPress={() => setShowTimePickerModal(true)}
                            >
                                <Text style={{ color: theme.colors.text, fontSize: 16 }}>
                                    {formatTo12Hour(localNotificationTime)}
                                </Text>
                            </TouchableOpacity>

                            <Text style={styles.helperText}>Tap to change time</Text>
                        </View>

                        {/* Notification types */}
                        <Text style={[styles.helperText, { marginTop: 8 }]}>Smart reminders (max ~2 per day):</Text>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Streak encouragement</Text>
                            <Switch value={!!notificationTypes?.streak} onValueChange={(v) => setNotificationTypes({ streak: v })} trackColor={{ false: '#767577', true: theme.colors.primary }} />
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Journal suggestion</Text>
                            <Switch value={!!notificationTypes?.journal} onValueChange={(v) => setNotificationTypes({ journal: v })} trackColor={{ false: '#767577', true: theme.colors.primary }} />
                        </View>
                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Motivational</Text>
                            <Switch value={!!notificationTypes?.motivational} onValueChange={(v) => setNotificationTypes({ motivational: v })} trackColor={{ false: '#767577', true: theme.colors.primary }} />
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Quiet hours (silence notifications)</Text>
                            <Switch 
                                value={!!quietHours?.enabled} 
                                onValueChange={(v) => setQuietHours({ ...quietHours, enabled: v })} 
                                trackColor={{ false: '#767577', true: theme.colors.primary }} 
                            />
                        </View>

                        {/* Clean native time picker modal — pulls up a proper scroll wheel */}
                        <Modal
                            visible={showTimePickerModal}
                            transparent={true}
                            animationType="slide"
                            onRequestClose={() => setShowTimePickerModal(false)}
                        >
                            <View style={styles.modalOverlay}>
                                <View style={styles.timePickerModalContent}>
                                    <View style={styles.timePickerHeader}>
                                        <TouchableOpacity onPress={() => setShowTimePickerModal(false)}>
                                            <Text style={styles.timePickerCancel}>Cancel</Text>
                                        </TouchableOpacity>
                                        <Text style={styles.timePickerTitle}>Reminder Time</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                // Confirm current pickerDate value
                                                const hours = pickerDate.getHours().toString().padStart(2, '0');
                                                const minutes = pickerDate.getMinutes().toString().padStart(2, '0');
                                                const newTime = `${hours}:${minutes}`;

                                                setLocalNotificationTime(newTime);
                                                setHasUnsavedNotificationChanges(true);
                                                setShowTimePickerModal(false);
                                            }}
                                        >
                                            <Text style={styles.timePickerDone}>Done</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <DateTimePicker
                                        value={pickerDate}
                                        mode="time"
                                        is24Hour={false}
                                        display="spinner"
                                        textColor="#ffffff"
                                        onChange={(event, selectedDate) => {
                                            if (selectedDate) {
                                                setPickerDate(selectedDate);
                                            }
                                        }}
                                    />
                                </View>
                            </View>
                        </Modal>

                        {/* Live scheduled status vs draft changes */}
                        {notificationsEnabled && (
                            <View style={{ marginBottom: 12, marginLeft: 4 }}>
                                {hasUnsavedNotificationChanges ? (
                                    <Text style={[styles.helperText, { color: theme.colors.primary }]}>
                                        You have unsaved changes. Tap Apply Changes below to update your scheduled reminder.
                                    </Text>
                                ) : (
                                    <Text style={styles.helperText}>
                                        Currently scheduled daily at {formatTo12Hour(notificationTime)}
                                    </Text>
                                )}
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Custom Message (optional)</Text>
                            <TextInput
                                style={[styles.input, { minHeight: 70 }]}
                                placeholder="You're doing great. Keep going."
                                value={localCustomMessage}
                                onChangeText={(msg) => {
                                    setLocalCustomMessage(msg);
                                    setHasUnsavedNotificationChanges(true);
                                }}
                                multiline
                                maxLength={120}
                                contextMenuHidden={false}
                            />
                            <Text style={styles.helperText}>
                                {localCustomMessage.length}/120 characters
                            </Text>
                        </View>

                        {hasUnsavedNotificationChanges && (
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: theme.colors.primary, marginBottom: 12 }]}
                                onPress={async () => {
                                    const success = await updateAndRescheduleNotifications({
                                        notificationTime: localNotificationTime,
                                        customNotificationMessage: localCustomMessage,
                                    });
                                    setHasUnsavedNotificationChanges(false);

                                    if (success) {
                                        Alert.alert(
                                            "Settings Applied",
                                            `Your daily reminder is now set for ${formatTo12Hour(localNotificationTime)}.`
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>Apply Changes</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: '#555', marginBottom: 20 }]}
                            onPress={async () => {
                                await sendTestNotificationIn10Seconds();
                            }}
                        >
                            <Text style={styles.buttonText}>Send Test Notification (in 10s)</Text>
                        </TouchableOpacity>
                    </>
                )}

                <Text style={styles.sectionTitle}>Advanced</Text>
                <Text style={[styles.helperText, { marginBottom: 12, marginLeft: 4 }]}>
                    Tools for testing and data management.
                </Text>

                <View style={styles.dataSection}>
                    <Text style={styles.relapseCount}>
                        {relapseHistory.length} relapse{relapseHistory.length === 1 ? '' : 's'} logged
                    </Text>

                    {/* Notification permission tool */}
                    {permissionStatus && (
                        <Text style={[styles.helperText, { textAlign: 'center', marginBottom: 10 }]}>
                            Permission: <Text style={{ fontWeight: '600' }}>
                                {typeof permissionStatus === 'object' ? permissionStatus.status : permissionStatus}
                            </Text>
                            {typeof permissionStatus === 'object' && (
                                ` (Alert: ${permissionStatus.allowsAlert ? 'Yes' : 'No'}, Sound: ${permissionStatus.allowsSound ? 'Yes' : 'No'})`
                            )}
                        </Text>
                    )}

                    <TouchableOpacity
                        style={[styles.dangerButton, { backgroundColor: '#555', marginBottom: 12 }]}
                        onPress={async () => {
                            const granted = await requestNotificationPermissions();
                            const status = await getNotificationPermissionStatus();
                            setPermissionStatus(status);
                            
                            if (granted) {
                                Alert.alert("Permissions Granted", "Notifications should now work. Try sending a test notification.");
                            } else {
                                Alert.alert("Permission Denied", "Please go to your iPhone Settings → Free'd → Notifications and enable them manually.");
                            }
                        }}
                    >
                        <Text style={styles.dangerButtonText}>Re-request Notification Permissions</Text>
                    </TouchableOpacity>

                    {/* Data reset tools */}
                    <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                        <Text style={styles.resetButtonText}>Reset Freedom Timer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.dangerButton, { marginTop: 12 }]} onPress={clearRelapseHistory}>
                        <Text style={styles.dangerButtonText}>Clear Relapse History</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.dangerButton, { marginTop: 12, backgroundColor: '#555' }]}
                        onPress={resetOnboarding}
                    >
                        <Text style={styles.dangerButtonText}>Restart Onboarding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.dangerButton, { marginTop: 12, backgroundColor: '#555' }]}
                        onPress={handleResetActiveDays}
                    >
                        <Text style={styles.dangerButtonText}>Reset Check-in Calendar</Text>
                    </TouchableOpacity>
                </View>
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
        marginTop: 50,
        marginBottom: 30,
        textAlign: 'center',
    },
    fixedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 70,           // Lowered a bit more as requested
        paddingBottom: 12,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.card,
    },
    headerTitle: {
        ...theme.fonts.title,
        color: theme.colors.text,
        fontSize: 20,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        backgroundColor: theme.colors.card,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        alignSelf: 'center',
        marginTop: 4,           // Small push down to better align with title text
    },
    backButtonText: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        color: theme.colors.text,
        marginTop: 25,
        marginBottom: 12,
    },
    input: {
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        padding: 15,
        borderRadius: theme.spacing.radius,
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 6,
        marginLeft: 4,
    },
    helperText: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginLeft: 4,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        marginBottom: 30,
    },
    buttonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    resetButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
        marginBottom: 30,
    },
    resetButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 15,
        borderRadius: theme.spacing.radius,
        marginBottom: 15,
    },
    toggleLabel: {
        color: theme.colors.text,
        fontSize: 16,
    },
    dataSection: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    relapseCount: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        marginBottom: 16,
        textAlign: 'center',
    },
    dangerButton: {
        backgroundColor: theme.colors.danger,
        padding: 16,
        borderRadius: theme.spacing.radius,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
    // Time picker modal styles (clean native wheel experience)
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    timePickerModalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    timePickerTitle: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: '600',
    },
    timePickerCancel: {
        color: '#aaaaaa',
        fontSize: 16,
    },
    timePickerDone: {
        color: theme.colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});