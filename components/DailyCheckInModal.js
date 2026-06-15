import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { theme } from '../theme';

export default function DailyCheckInModal({ visible, onClose, activeDays }) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Remove any future dates from activeDays (cleanup from previous bugs)
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const cleanedActiveDays = activeDays.filter(d => d <= todayStr);

    // Generate days for current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const calendarDays = [];

    // Empty slots for days before the 1st
    for (let i = 0; i < firstDayOfWeek; i++) {
        calendarDays.push(null);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isActive = cleanedActiveDays.includes(dateStr);
        const isToday = day === today.getDate();
        calendarDays.push({ day, dateStr, isActive, isToday });
    }

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Great to see you today!</Text>
                    <Text style={styles.subtitle}>
                        You've checked in for another day. Keep going.
                    </Text>

                    {/* Weekday headers */}
                    <View style={styles.weekdayRow}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <Text key={i} style={styles.weekday}>{d}</Text>
                        ))}
                    </View>

                    {/* Days Grid - same structure as Progress page */}
                    <View style={styles.calendarGrid}>
                        {calendarDays.map((item, index) => {
                            if (!item) {
                                return <View key={index} style={styles.emptyDay} />;
                            }

                            return (
                                <View
                                    key={index}
                                    style={[
                                        styles.day,
                                        item.isActive && styles.activeDay,
                                        item.isToday && styles.today,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            (item.isActive || item.isToday) && styles.activeDayText,
                                        ]}
                                    >
                                        {item.day}
                                    </Text>
                                    {item.isActive && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        color: theme.colors.text,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 24,
    },
    weekdayRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: 280,
        alignSelf: 'center',
        marginBottom: 4,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        width: 280,
        alignSelf: 'center',
        marginBottom: 24,
    },
    weekday: {
        width: 36,
        textAlign: 'center',
        color: theme.colors.textTertiary,
        fontSize: 13,
    },
    day: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 2,
        borderRadius: 18,
    },
    activeDay: {
        backgroundColor: theme.colors.primary,
    },
    today: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    dayText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
    },
    activeDayText: {
        color: '#fff',
        fontWeight: '600',
    },
    checkmark: {
        position: 'absolute',
        top: 2,
        right: 2,
        fontSize: 10,
        color: '#fff',
    },
    emptyDay: {
        width: 36,
        height: 36,
        margin: 2,
    },
    closeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});