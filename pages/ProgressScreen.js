// pages/ProgressScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function ProgressScreen() {
    const { freedomStartDate, relapseHistory, activeDays, setRelapseHistory, temptationReflections, deleteTemptationReflection } = useStore();

    // Use the centralized store method for the true consecutive login streak (days in a row the app was opened).
    // This is the authoritative "current streak" of consecutive days logged in.
    const streak = useStore((state) => (state.getCurrentStreak ? state.getCurrentStreak() : 0));

    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'insights'
    const [selectedReflection, setSelectedReflection] = useState(null);

    // One-time migration: wipe old simple-format relapse data (moved from Journal)
    useEffect(() => {
        const hasOldFormat = relapseHistory.some(
            (r) => r.date && !r.timestamp
        );
        if (hasOldFormat && relapseHistory.length > 0) {
            console.log("Wiping old relapse data format...");
            setRelapseHistory([]);
        }
    }, []);

    // === Insights Calculations (for Insights & History tab) ===
    const getInsights = (history) => {
        if (!history || history.length === 0) return null;

        const total = history.length;

        // Count trigger apps
        const appCounts = {};
        const locationCounts = {};
        const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };

        history.forEach((relapse) => {
            const app = relapse.triggerApp || 'Unknown';
            appCounts[app] = (appCounts[app] || 0) + 1;

            if (relapse.location) {
                locationCounts[relapse.location] = (locationCounts[relapse.location] || 0) + 1;
            }

            if (relapse.timestamp) {
                const hour = new Date(relapse.timestamp).getHours();
                if (hour >= 5 && hour < 12) timeBuckets.Morning++;
                else if (hour >= 12 && hour < 17) timeBuckets.Afternoon++;
                else if (hour >= 17 && hour < 22) timeBuckets.Evening++;
                else timeBuckets.Night++;
            }
        });

        const topApps = Object.entries(appCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([app, count]) => ({ app, count }));

        const topLocations = Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([loc, count]) => ({ location: loc, count }));

        return {
            total,
            topApps,
            topLocations,
            timeBuckets,
        };
    };

    const insights = getInsights(relapseHistory);

    // Calculate days free from the start date
    const calculateDaysFree = () => {
        if (!freedomStartDate) return 0;
        const now = new Date();
        const start = new Date(freedomStartDate);
        return Math.floor((now - start) / (1000 * 60 * 60 * 24));
    };

    const daysFree = calculateDaysFree();

    // Simple relapse vs active days visualization
    const totalRelapses = relapseHistory.length;
    const activeDaysRatio = daysFree > 0 ? Math.min((daysFree / (daysFree + totalRelapses)) * 100, 100) : 0;

    // Reusable stat card with press lift animation
    const StatCard = ({ value, label }) => {
        const scale = useSharedValue(1);
        const style = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
        }));

        return (
            <TouchableOpacity
                style={styles.statBox}
                activeOpacity={0.85}
                onPressIn={() => { scale.value = withTiming(0.96, { duration: 80 }); }}
                onPressOut={() => { scale.value = withTiming(1, { duration: 160 }); }}
            >
                <Animated.View style={[style, { alignItems: 'center' }]}>
                    <Text style={styles.statNumber}>{value}</Text>
                    <Text style={styles.statLabel}>{label}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    // Simple monthly calendar renderer with Reanimated press feedback + today pulse
    const renderMonthlyCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push({
                day: d,
                isActive: activeDays.includes(dateStr),
                isToday: d === today.getDate(),
                dateStr,
            });
        }

        const weekdays = ['S','M','T','W','T','F','S'];

        // Local animated day component for press scale + today pulse
        const CalendarDay = ({ item }) => {
            const scale = useSharedValue(1);
            const todayPulse = useSharedValue(item.isToday ? 0 : 0);

            const dayStyle = useAnimatedStyle(() => ({
                transform: [{ scale: scale.value }],
            }));

            const todayRingStyle = useAnimatedStyle(() => ({
                opacity: 0.55 + (todayPulse.value * 0.45),
                transform: [{ scale: 1 + todayPulse.value * 0.09 }],
            }));

            // Gentle continuous pulse only on the current day.
            // Moved into useEffect so we don't mutate the shared value on every render of the cell.
            useEffect(() => {
                if (item.isToday) {
                    todayPulse.value = withRepeat(
                        withSequence(
                            withTiming(1, { duration: 1850 }),
                            withTiming(0, { duration: 1850 })
                        ),
                        -1,
                        false
                    );
                }
            }, [item.isToday]);

            const handlePress = () => {
                // Use withSequence instead of setTimeout + manual reset.
                // This keeps everything on the UI thread and prevents the "frozen current/undefined ref" error
                // that happens when a setTimeout fires after the CalendarDay (and its useSharedValue) has been
                // unmounted or its internal holder frozen by React during re-renders / tab switches.
                scale.value = withSequence(
                    withTiming(0.86, { duration: 55 }),
                    withTiming(1, { duration: 170 })
                );
            };

            return (
                <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
                    <Animated.View
                        style={[
                            styles.calendarDay,
                            item.isActive && styles.activeCalendarDay,
                            item.isToday && styles.todayCalendarDay,
                            dayStyle,
                        ]}
                    >
                        {item.isToday && (
                            <Animated.View
                                style={[
                                    styles.todayRing,
                                    todayRingStyle,
                                ]}
                            />
                        )}
                        <Text style={[
                            styles.calendarDayText,
                            (item.isActive || item.isToday) && styles.activeDayText
                        ]}>
                            {item.day}
                        </Text>
                        {item.isActive && <Text style={styles.check}>✓</Text>}
                    </Animated.View>
                </TouchableOpacity>
            );
        };

        return (
            <View style={styles.calendarSection}>
                <Text style={styles.calendarTitle}>
                    {today.toLocaleString('default', { month: 'long' })} {year}
                </Text>

                {/* Weekday headers - separate row for better alignment */}
                <View style={styles.weekdayRow}>
                    {weekdays.map((d, i) => (
                        <Text key={i} style={styles.weekday}>{d}</Text>
                    ))}
                </View>

                {/* Days grid */}
                <View style={styles.calendarGrid}>
                    {days.map((item, index) => {
                        if (!item) {
                            return <View key={index} style={styles.calendarDay} />;
                        }
                        return <CalendarDay key={index} item={item} />;
                    })}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ScreenContainer backgroundColor={theme.colors.background}>
                <Text style={styles.title}>Insights</Text>

                {/* Sub-tab selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'overview' && styles.activeTab]}
                        onPress={() => setActiveTab('overview')}
                    >
                        <Text style={activeTab === 'overview' ? styles.activeTabText : styles.tabText}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'insights' && styles.activeTab]}
                        onPress={() => setActiveTab('insights')}
                    >
                        <Text style={activeTab === 'insights' ? styles.activeTabText : styles.tabText}>Insights & History</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === 'overview' ? (
                    <>
                        <View style={styles.statsContainer}>
                            <StatCard value={streak} label="Current Streak" />
                            <StatCard value={daysFree} label="Days Free" />
                            <StatCard value={totalRelapses} label="Total Relapses" />
                            <StatCard value={`${Math.round(activeDaysRatio)}%`} label="Active vs Relapse Ratio" />
                        </View>

                        {/* Simple visual bar */}
                        {daysFree > 0 && (
                            <View style={styles.visualSection}>
                                <Text style={styles.visualTitle}>Days Free vs Relapses</Text>
                                <View style={styles.barBackground}>
                                    <View 
                                        style={[
                                            styles.barFill, 
                                            { width: `${activeDaysRatio}%` }
                                        ]} 
                                    />
                                </View>
                                <Text style={styles.barLabel}>
                                    {Math.round(activeDaysRatio)}% of your tracked time has been relapse-free
                                </Text>
                            </View>
                        )}

                        {/* Monthly Activity Calendar */}
                        {renderMonthlyCalendar()}

                        <Text style={styles.motivation}>
                            You're making real progress. Every day you choose freedom matters.
                        </Text>
                    </>
                ) : (
                    // Insights & History tab - rendered as scrollable content inside ScreenContainer
                    <>
                        {insights ? (
                            <>
                                {/* Summary Stats */}
                                <View style={styles.insightCard}>
                                    <Text style={styles.insightTitle}>Summary</Text>
                                    <Text style={styles.insightBigNumber}>{insights.total}</Text>
                                    <Text style={styles.insightLabel}>Total Relapses Logged</Text>
                                </View>

                                {/* Top Trigger Apps */}
                                {insights.topApps.length > 0 && (
                                    <View style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>Top Trigger Apps</Text>
                                        {insights.topApps.map((item, index) => (
                                            <View key={index} style={styles.insightRow}>
                                                <Text style={styles.insightText}>{item.app}</Text>
                                                <Text style={styles.insightCount}>{item.count}x</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Time of Day */}
                                <View style={styles.insightCard}>
                                    <Text style={styles.insightTitle}>Time of Day</Text>
                                    {Object.entries(insights.timeBuckets).map(([time, count]) => (
                                        count > 0 && (
                                            <View key={time} style={styles.insightRow}>
                                                <Text style={styles.insightText}>{time}</Text>
                                                <Text style={styles.insightCount}>{count}x</Text>
                                            </View>
                                        )
                                    ))}
                                </View>

                                {/* Top Locations */}
                                {insights.topLocations.length > 0 && (
                                    <View style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>Common Locations</Text>
                                        {insights.topLocations.map((item, index) => (
                                            <View key={index} style={styles.insightRow}>
                                                <Text style={styles.insightText}>{item.location}</Text>
                                                <Text style={styles.insightCount}>{item.count}x</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Recommendations based on patterns */}
                                <View style={styles.insightCard}>
                                    <Text style={styles.insightTitle}>Personalized Recommendations</Text>
                                    {insights.topApps.length > 0 && (
                                        <Text style={styles.recommendationText}>
                                            • Your top trigger app is {insights.topApps[0].app}. Consider using the Protect section for guided blocking during high-risk times.
                                        </Text>
                                    )}
                                    {Object.entries(insights.timeBuckets).some(([time, count]) => count > 0 && time === 'Evening') && (
                                        <Text style={styles.recommendationText}>
                                            • Evenings are a common time for you. Try opening the Support tab for music or a quick reflection when urges hit.
                                        </Text>
                                    )}
                                    <Text style={styles.recommendationText}>
                                        • Review your reflections regularly — patterns become clearer over time.
                                    </Text>
                                </View>

                                {/* History List Header */}
                                <Text style={[styles.sectionTitle, { fontSize: 18, marginTop: 20, marginBottom: 12 }]}>
                                    Relapse History
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.emptyText}>
                                No relapses logged yet. When you log one from the Home screen, insights will appear here.
                            </Text>
                        )}

                        {/* Relapse History Items */}
                        {relapseHistory.length > 0 ? (
                            relapseHistory.map((item) => (
                                <View key={item.id} style={styles.relapseItem}>
                                    <Text style={styles.relapseDate}>
                                        {new Date(item.timestamp).toLocaleString()}
                                    </Text>

                                    <Text style={styles.relapseApp}>
                                        {item.triggerApp}
                                        {item.triggerDescription ? ` — ${item.triggerDescription}` : ''}
                                    </Text>

                                    {item.location && (
                                        <Text style={styles.relapseLocation}>📍 {item.location}</Text>
                                    )}

                                    {item.note && (
                                        <Text style={styles.relapseNote}>{item.note}</Text>
                                    )}
                                </View>
                            ))
                        ) : null}

                        {/* Temptation Reflections */}
                        <Text style={[styles.sectionTitle, { fontSize: 18, marginTop: 24, marginBottom: 12 }]}>
                            Facing Temptation Reflections
                        </Text>

                        {temptationReflections.length > 0 ? (
                            temptationReflections.map((reflection) => {
                                const date = new Date(reflection.timestamp).toLocaleString();
                                const preview = reflection.answers && reflection.answers[0] ? reflection.answers[0].slice(0, 60) + '...' : 'Reflection saved';
                                return (
                                    <TouchableOpacity 
                                        key={reflection.id} 
                                        style={styles.reflectionItem}
                                        onPress={() => setSelectedReflection(reflection)}
                                    >
                                        <Text style={styles.reflectionDate}>{date}</Text>
                                        <Text style={styles.reflectionPreview}>{preview}</Text>
                                        <Text style={styles.reflectionHint}>Tap to view full</Text>
                                    </TouchableOpacity>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyText}>
                                No temptation reflections yet. Use the button on the Home screen when you're facing a tough moment.
                            </Text>
                        )}
                    </>
                )}

                {/* Modal to view full Temptation Reflection */}
                {selectedReflection && (
                    <Modal
                        visible={!!selectedReflection}
                        transparent={true}
                        animationType="slide"
                        onRequestClose={() => setSelectedReflection(null)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Reflection from {new Date(selectedReflection.timestamp).toLocaleString()}</Text>
                                <ScrollView style={{ maxHeight: 400 }}>
                                    {selectedReflection.prompts && selectedReflection.answers && selectedReflection.prompts.map((prompt, i) => (
                                        <View key={i} style={styles.reflectionDetailItem}>
                                            <Text style={styles.reflectionPrompt}>{prompt}</Text>
                                            <Text style={styles.reflectionAnswer}>{selectedReflection.answers[i] || '(no answer)'}</Text>
                                        </View>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity 
                                    style={[styles.modalCloseButton, { backgroundColor: theme.colors.danger }]} 
                                    onPress={() => {
                                        deleteTemptationReflection(selectedReflection.id);
                                        setSelectedReflection(null);
                                    }}
                                >
                                    <Text style={styles.modalCloseText}>Delete Reflection</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalCloseButton, { marginTop: 8 }]} 
                                    onPress={() => setSelectedReflection(null)}
                                >
                                    <Text style={styles.modalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                )}
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
        justifyContent: 'space-around',
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
    visualSection: {
        marginTop: 20,
        marginBottom: 10,
    },
    visualTitle: {
        color: theme.colors.text,
        fontSize: 16,
        marginBottom: 10,
        textAlign: 'center',
    },
    barBackground: {
        height: 20,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
    barLabel: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
    },
    calendarSection: {
        marginTop: 24,
    },
    calendarTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    calendarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',   // Changed from center for more predictable wrapping
        width: 252,                      // Exactly 7 columns (34*7 + small margins)
        alignSelf: 'center',
    },
    weekdayRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: 252,
        alignSelf: 'center',
        marginBottom: 4,
    },
    weekday: {
        width: 34,
        textAlign: 'center',
        color: theme.colors.textTertiary,
        fontSize: 12,
    },
    calendarDay: {
        width: 34,
        height: 34,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 1,
        borderRadius: 17,
        position: 'relative',
    },
    activeCalendarDay: {
        backgroundColor: theme.colors.primary,
    },
    todayCalendarDay: {
        borderWidth: 2,
        borderColor: '#fff',
    },
    calendarDayText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
    },
    activeDayText: {
        color: '#fff',
        fontWeight: '600',
    },
    check: {
        position: 'absolute',
        top: 1,
        right: 2,
        fontSize: 9,
        color: '#fff',
    },
    todayRing: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
        top: 2,
        left: 2,
    },

    // Tab styles for sub-navigation (Overview / Insights & History)
    tabContainer: { 
        flexDirection: 'row', 
        marginBottom: 20, 
        backgroundColor: theme.colors.card, 
        borderRadius: 12, 
        padding: 4,
        marginTop: 10,
    },
    tabButton: { 
        flex: 1, 
        padding: 12, 
        alignItems: 'center', 
        borderRadius: 10 
    },
    activeTab: { 
        backgroundColor: theme.colors.primary 
    },
    tabText: { 
        color: theme.colors.textSecondary 
    },
    activeTabText: { 
        color: '#ffffff', 
        fontWeight: 'bold' 
    },

    // Insights styles (ported from previous Journal location)
    sectionTitle: { 
        fontSize: 22, 
        color: theme.colors.text, 
        marginBottom: 15 
    },
    insightCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
    },
    insightTitle: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    insightBigNumber: {
        color: theme.colors.text,
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    insightLabel: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    insightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    insightText: {
        color: theme.colors.text,
        fontSize: 15,
    },
    insightCount: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    recommendationText: {
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: 6,
        lineHeight: 18,
    },

    // Relapse history item styles
    relapseItem: { 
        backgroundColor: theme.colors.card, 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 12 
    },
    relapseDate: { 
        color: theme.colors.primary, 
        fontSize: 14 
    },
    relapseApp: { 
        color: theme.colors.text, 
        fontSize: 16, 
        marginTop: 4, 
        fontWeight: '500' 
    },
    relapseLocation: { 
        color: theme.colors.textSecondary, 
        fontSize: 14, 
        marginTop: 2 
    },
    relapseNote: { 
        color: theme.colors.textSecondary, 
        marginTop: 6, 
        fontStyle: 'italic' 
    },
    emptyText: { 
        color: theme.colors.textTertiary, 
        textAlign: 'center', 
        marginTop: 50 
    },

    // Temptation Reflection styles in Insights
    reflectionItem: {
        backgroundColor: theme.colors.card,
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    reflectionDate: {
        color: theme.colors.primary,
        fontSize: 13,
        marginBottom: 4,
    },
    reflectionPreview: {
        color: theme.colors.text,
        fontSize: 15,
    },
    reflectionHint: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginTop: 4,
        fontStyle: 'italic',
    },

    // Modal for viewing full reflection
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    reflectionDetailItem: {
        marginBottom: 16,
    },
    reflectionPrompt: {
        color: theme.colors.primary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    reflectionAnswer: {
        color: theme.colors.text,
        fontSize: 15,
        lineHeight: 20,
    },
    modalCloseButton: {
        marginTop: 12,
        backgroundColor: '#444',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#fff',
        fontWeight: '600',
    },
});