import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function ProfileScreen({ onClose, onOpenSettings }) {
    const { 
        nickname, 
        setNickname,
        personalNote,
        isFaithBased,
        setIsFaithBased,
    } = useStore();

    const { getCurrentStreak, freedomStartDate, activeDays } = useStore.getState();

    const [editNickname, setEditNickname] = useState(nickname);
    const [isEditingNickname, setIsEditingNickname] = useState(false);

    const streak = getCurrentStreak ? getCurrentStreak() : 0;
    const daysFree = freedomStartDate 
        ? Math.floor((new Date() - new Date(freedomStartDate)) / (1000 * 60 * 60 * 24)) 
        : 0;
    const activeDayCount = activeDays ? activeDays.length : 0;



    return (
        <View style={styles.container}>
            {/* Header with back left, centered title, and settings right */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Profile</Text>

                <TouchableOpacity
                    onPress={onOpenSettings}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="settings" size={22} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScreenContainer backgroundColor={theme.colors.background}>

                {/* Profile avatar */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        {nickname?.trim() ? (
                            <Text style={styles.avatarText}>
                                {getInitials(nickname)}
                            </Text>
                        ) : (
                            <Feather name="user" size={28} color="#fff" />
                        )}
                    </View>
                    <Text style={styles.avatarHint}>Using initials (photo support coming soon)</Text>
                </View>

                {isEditingNickname ? (
                    <View style={styles.nicknameEdit}>
                        <TextInput
                            style={styles.nicknameInput}
                            value={editNickname}
                            onChangeText={setEditNickname}
                            placeholder="Enter nickname"
                            autoFocus
                        />
                        <View style={styles.nicknameButtons}>
                            <TouchableOpacity 
                                style={styles.smallButton} 
                                onPress={() => {
                                    setIsEditingNickname(false);
                                    setEditNickname(nickname);
                                }}
                            >
                                <Text style={styles.smallButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.smallButton, styles.saveButton]} 
                                onPress={() => {
                                    if (editNickname.trim()) {
                                        setNickname(editNickname.trim());
                                        setIsEditingNickname(false);
                                    } else {
                                        Alert.alert("Nickname required", "Please enter a nickname.");
                                    }
                                }}
                            >
                                <Text style={styles.smallButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        {nickname?.trim() ? (
                            <Text style={styles.nickname}>{nickname}</Text>
                        ) : (
                            <Text style={styles.noNickname}>No nickname set yet</Text>
                        )}
                        <TouchableOpacity onPress={() => {
                            setEditNickname(nickname);
                            setIsEditingNickname(true);
                        }}>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* Personal Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="trending-up" size={16} color={theme.colors.primary} />
                        <Text style={styles.sectionHeaderText}>Your Progress</Text>
                    </View>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{streak}</Text>
                            <Text style={styles.statLabel}>Current Streak</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{daysFree}</Text>
                            <Text style={styles.statLabel}>Days Free</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{activeDayCount}</Text>
                            <Text style={styles.statLabel}>Days Logged</Text>
                        </View>
                    </View>
                </View>

                {/* Personal Note quick access */}
                <View style={styles.noteCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="book-open" size={16} color={theme.colors.primary} />
                        <Text style={styles.sectionHeaderText}>Personal Note</Text>
                    </View>
                    {personalNote?.trim() ? (
                        <Text style={styles.notePreview} numberOfLines={2}>
                            {personalNote}
                        </Text>
                    ) : (
                        <Text style={styles.noteEmpty}>No note yet. Add one in the Learn tab.</Text>
                    )}
                    <TouchableOpacity onPress={() => {
                        Alert.alert('Personal Note', 'You can edit your personal note in the Learn tab.');
                    }}>
                        <Text style={styles.editLink}>View / Edit in Learn</Text>
                    </TouchableOpacity>
                </View>

                {/* Preferences */}
                <View style={styles.prefsCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="heart" size={16} color={theme.colors.primary} />
                        <Text style={styles.sectionHeaderText}>Preferences</Text>
                    </View>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Faith-Based Encouragement</Text>
                        <Switch
                            value={isFaithBased}
                            onValueChange={setIsFaithBased}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                        />
                    </View>
                </View>

                {/* Quick Links */}
                <View style={styles.linksCard}>
                    <View style={styles.sectionHeader}>
                        <Feather name="link" size={16} color={theme.colors.primary} />
                        <Text style={styles.sectionHeaderText}>Quick Links</Text>
                    </View>
                    <TouchableOpacity style={styles.linkItem} onPress={() => Alert.alert('Reflections', 'Your temptation reflections are available in the Insights tab.')}>
                        <Feather name="message-circle" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.linkText}>View Reflections</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkItem} onPress={onOpenSettings}>
                        <Feather name="settings" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.linkText}>All Settings</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.hint}>
                    Tap the gear icon above for notifications, data tools, and more.
                </Text>
            </ScreenContainer>
        </View>
    );
}

function getInitials(name) {
    if (!name || !name.trim()) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 12,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '600',
    },
    nickname: {
        color: theme.colors.text,
        fontSize: 22,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 28,
    },
    noNickname: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    editLink: {
        color: theme.colors.primary,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 28,
    },
    nicknameEdit: {
        alignItems: 'center',
        marginBottom: 16,
    },
    nicknameInput: {
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        fontSize: 18,
        padding: 10,
        borderRadius: 8,
        width: '70%',
        textAlign: 'center',
        marginBottom: 8,
    },
    nicknameButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    smallButton: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 6,
        backgroundColor: '#333',
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    smallButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    hint: {
        color: theme.colors.textTertiary,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
    },
    noteCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    noteTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    notePreview: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    noteEmpty: {
        color: theme.colors.textTertiary,
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    linksCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    linkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    linkText: {
        color: theme.colors.text,
        fontSize: 15,
        marginLeft: 10,
    },
    prefsCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleLabel: {
        color: theme.colors.text,
        fontSize: 15,
    },
    avatarHint: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginTop: 6,
    },
    summaryCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionHeaderText: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    summaryTitle: {
        color: theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        color: theme.colors.primary,
        fontSize: 22,
        fontWeight: 'bold',
    },
    statLabel: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
});
