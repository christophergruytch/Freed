import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';
import useStore from '../store/useStore';
import ScreenContainer from '../components/ScreenContainer';

export default function ProfileScreen({ onClose, onOpenSettings }) {
    const { nickname } = useStore();

    return (
        <View style={styles.container}>
            {/* Header with back left and settings right */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onOpenSettings}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="settings" size={22} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            <ScreenContainer backgroundColor={theme.colors.background}>
                <Text style={styles.title}>Profile</Text>

                {/* Big profile avatar preview */}
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
                </View>

                {nickname?.trim() ? (
                    <Text style={styles.nickname}>{nickname}</Text>
                ) : (
                    <Text style={styles.noNickname}>No nickname set yet</Text>
                )}

                <View style={styles.placeholderCard}>
                    <Text style={styles.placeholderTitle}>Your Profile</Text>
                    <Text style={styles.placeholderText}>
                        This is where your personal information and settings will live.
                        We'll organize the sections, preferences, and profile customizations here soon.
                    </Text>
                </View>

                <Text style={styles.hint}>
                    Tap the settings icon in the top right to access all app settings.
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
    title: {
        ...theme.fonts.title,
        color: theme.colors.text,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 24,
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
        marginBottom: 28,
        fontStyle: 'italic',
    },
    placeholderCard: {
        backgroundColor: theme.colors.card,
        padding: 20,
        borderRadius: theme.spacing.radius,
        marginBottom: 24,
    },
    placeholderTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    placeholderText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
    },
    hint: {
        color: theme.colors.textTertiary,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 20,
    },
});
