// pages/CommunityScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput, Linking, Keyboard, TouchableWithoutFeedback, Platform } from 'react-native';
import { scheduleReminders } from '../services/notifications';
import { theme } from '../theme';
import ScreenContainer from '../components/ScreenContainer';
import useStore from '../store/useStore';
import Button from '../components/Button';

// Detect playlist source from URL for filtering and display
function detectSource(url) {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('spotify.com') || lower.includes('spotify')) return 'spotify';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('music.apple.com') || lower.includes('apple music')) return 'apple';
  if (lower.includes('amazon.com') && lower.includes('music')) return 'amazon';
  if (lower.includes('soundcloud.com')) return 'soundcloud';
  return 'other';
}

const SOURCE_LABELS = {
  all: 'All',
  spotify: 'Spotify',
  youtube: 'YouTube',
  apple: 'Apple Music',
  amazon: 'Amazon Music',
  soundcloud: 'SoundCloud',
  other: 'Other',
};

const SOURCE_COLORS = {
  spotify: '#1DB954',
  youtube: '#FF0000',
  apple: '#FA2D48',
  amazon: '#FF9900',
  soundcloud: '#FF5500',
  other: '#666666',
};

export default function CommunityScreen() {
    const { userPlaylists, addUserPlaylist, deleteUserPlaylist, updateUserPlaylist } = useStore();

    const [activeSection, setActiveSection] = useState('music'); // 'music' | 'discussions' | 'partners'

    // Music filter state
    const [activeFilter, setActiveFilter] = useState('all');

    // Add Playlist Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newSource, setNewSource] = useState('other'); // for manual override in modal

    const [editingPlaylist, setEditingPlaylist] = useState(null);

    const sections = [
        { key: 'music', label: 'Music' },
        { key: 'protect', label: 'Protect ★' },
        { key: 'ai', label: 'AI Coach' },
        { key: 'partners', label: 'Partners' },
    ];

    // Simple protect recommendations based on store data (reuses insights logic)
    const { relapseHistory, temptationReflections, addProtectSchedule } = useStore();

    const getProtectRecommendation = () => {
        if (!relapseHistory || relapseHistory.length === 0) {
            return "Start logging relapses and reflections to get personalized suggestions, like blocking your top trigger app during evenings.";
        }
        // Simple top app / time from data
        const appCounts = {};
        const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
        relapseHistory.forEach((r) => {
            const app = r.triggerApp || 'Unknown';
            appCounts[app] = (appCounts[app] || 0) + 1;
            if (r.timestamp) {
                const hour = new Date(r.timestamp).getHours();
                if (hour >= 5 && hour < 12) timeBuckets.Morning++;
                else if (hour >= 12 && hour < 17) timeBuckets.Afternoon++;
                else if (hour >= 17 && hour < 22) timeBuckets.Evening++;
                else timeBuckets.Night++;
            }
        });
        const topApp = Object.entries(appCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'your top app';
        const topTime = Object.entries(timeBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || 'evenings';
        return `Block ${topApp} during ${topTime.toLowerCase()}. Tap below to open your device's Focus/Digital Wellbeing settings with this pre-suggested.`;
    };

    const openProtectSettings = () => {
        // Cross platform best effort - opens general settings or Screen Time on iOS
        const url = Platform.OS === 'ios' 
            ? 'app-settings:' 
            : 'android.settings.SETTINGS'; // or more specific for Digital Wellbeing
        Linking.openURL(url).catch(() => {
            Alert.alert(
                "Open Settings Manually",
                "Please go to your phone's Settings > Focus (iOS) or Digital Wellbeing (Android) and set up a schedule for your top triggers."
            );
        });
    };

    const saveProtectionRec = () => {
        const rec = getProtectRecommendation();
        const newSchedule = {
            recommendation: rec,
            savedAt: new Date().toISOString(),
            // Simple high risk time suggestion
            suggestedTime: '20:00',
        };
        addProtectSchedule(newSchedule);

        // Wire to notifications: schedule a protective nudge (respecting limits in service)
        scheduleReminders({
            enabled: true,
            dailyTime: '20:00',
            customMessage: `Protect yourself: ${rec.slice(0, 80)}`,
            types: { daily: false, streak: false, journal: false, motivational: true },
            quietHours: { enabled: false, start: '22:00', end: '07:00' },
            relapseHistory,
        }).catch(() => {});

        Alert.alert(
            "Recommendation Saved",
            "Saved to your protect list and a gentle nudge has been scheduled (if within limits)."
        );
    };

    // No default curated playlists (user requested removal as links were not reliable)
    const curatedPlaylists = [];

    // Filter logic for music section
    const filteredCurated = activeFilter === 'all'
        ? curatedPlaylists
        : curatedPlaylists.filter(p => p.source === activeFilter);

    const filteredUser = activeFilter === 'all'
        ? userPlaylists
        : userPlaylists.filter(p => (p.source || detectSource(p.url)) === activeFilter);

    const handleListen = async (playlist) => {
        if (playlist.url) {
            try {
                const supported = await Linking.canOpenURL(playlist.url);
                if (supported) {
                    await Linking.openURL(playlist.url);
                } else {
                    Alert.alert("Unable to open link", "Please copy the link manually.");
                }
            } catch (error) {
                Alert.alert("Error", "Could not open the playlist link.");
            }
        } else {
            Alert.alert(
                playlist.title,
                "No link available for this playlist yet."
            );
        }
    };

    const openAddModal = () => {
        setEditingPlaylist(null);
        setNewTitle('');
        setNewUrl('');
        setNewDescription('');
        setNewSource('other');
        setShowAddModal(true);
    };

    const openEditModal = (playlist) => {
        setEditingPlaylist(playlist);
        setNewTitle(playlist.title || '');
        setNewUrl(playlist.url || '');
        setNewDescription(playlist.description || '');
        setNewSource(playlist.source || detectSource(playlist.url) || 'other');
        setShowAddModal(true);
    };

    const saveNewPlaylist = () => {
        if (!newTitle.trim()) {
            Alert.alert("Title Required", "Please enter a title for the playlist.");
            return;
        }

        const detected = detectSource(newUrl);
        const finalSource = newSource !== 'other' ? newSource : detected;

        // Warn about YouTube
        if (finalSource === 'youtube') {
            Alert.alert(
                "YouTube Link Added",
                "YouTube can contain triggering thumbnails, comments, or recommendations. Consider using Spotify, Apple Music, or Amazon Music when possible for a safer distraction experience.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Save Anyway",
                        onPress: () => actuallySavePlaylist(finalSource),
                    },
                ]
            );
            return;
        }

        actuallySavePlaylist(finalSource);
    };

    const actuallySavePlaylist = (source) => {
        if (editingPlaylist) {
            updateUserPlaylist(editingPlaylist.id, {
                title: newTitle.trim(),
                url: newUrl.trim() || undefined,
                description: newDescription.trim() || "My personal playlist",
                source,
            });
        } else {
            const playlist = {
                title: newTitle.trim(),
                url: newUrl.trim() || undefined,
                description: newDescription.trim() || "My personal playlist",
                curator: "You",
                duration: "",
                source,
            };
            addUserPlaylist(playlist);
        }

        setShowAddModal(false);
        setEditingPlaylist(null);
        setNewTitle('');
        setNewUrl('');
        setNewDescription('');
        setNewSource('other');
    };

    const handleDeletePlaylist = (id, title) => {
        Alert.alert(
            "Delete Playlist?",
            `Remove "${title}" from your list?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteUserPlaylist(id),
                },
            ]
        );
    };

    const saveCuratedToMyList = (playlist) => {
        // Avoid duplicates by checking title
        const exists = userPlaylists.some(p => p.title === playlist.title);
        if (exists) {
            Alert.alert("Already Saved", "This playlist is already in your list.");
            return;
        }

        addUserPlaylist({
            title: playlist.title,
            url: playlist.url,
            description: playlist.description,
            curator: playlist.curator,
            duration: playlist.duration,
            source: playlist.source || detectSource(playlist.url),
        });

        Alert.alert("Saved!", `"${playlist.title}" has been added to Your Playlists.`);
    };

    return (
        <View style={styles.container}>
            <ScreenContainer backgroundColor={theme.colors.background}>
                <Text style={styles.title}>Support</Text>
                <Text style={styles.subtitle}>
                    Tools to help you through difficult moments: music, AI Coach, and partners.
                </Text>

                {/* Section Selector - horizontal scroll like the source filter */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.sectionScroll}
                    contentContainerStyle={styles.sectionContainer}
                >
                    {sections.map((section) => (
                        <TouchableOpacity
                            key={section.key}
                            style={[
                                styles.sectionButton,
                                activeSection === section.key && styles.sectionButtonActive,
                            ]}
                            onPress={() => setActiveSection(section.key)}
                        >
                            <Text
                                style={[
                                    styles.sectionButtonText,
                                    activeSection === section.key && styles.sectionButtonTextActive,
                                ]}
                            >
                                {section.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* MUSIC SECTION */}
                {activeSection === 'music' && (
                    <>
                        <Text style={styles.sectionIntro}>
                            Music can be a powerful positive distraction during difficult moments. 
                            Add your own playlists from Spotify, YouTube, Apple Music, etc. below.
                        </Text>

                        {/* Source Filter */}
                        <Text style={styles.filterLabel}>Filter by source</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            style={styles.filterScroll}
                            contentContainerStyle={styles.filterContainer}
                        >
                            {Object.keys(SOURCE_LABELS).map((key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.filterChip,
                                        activeFilter === key && styles.filterChipActive,
                                        key !== 'all' && activeFilter === key && { borderColor: SOURCE_COLORS[key] }
                                    ]}
                                    onPress={() => setActiveFilter(key)}
                                >
                                    <Text 
                                        style={[
                                            styles.filterChipText,
                                            activeFilter === key && styles.filterChipTextActive
                                        ]}
                                    >
                                        {SOURCE_LABELS[key]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Curated Playlists - currently empty per user request (default links removed) */}
                        {filteredCurated.length > 0 && (
                            <>
                                <Text style={styles.listTitle}>Curated Playlists</Text>
                                {filteredCurated.map((playlist) => (
                                    <View key={playlist.id} style={styles.playlistCard}>
                                        <View style={styles.playlistHeader}>
                                            <Text style={styles.playlistTitle}>{playlist.title}</Text>
                                            <Text style={styles.playlistDuration}>{playlist.duration}</Text>
                                        </View>
                                        <View style={styles.sourceRow}>
                                            <Text style={styles.playlistCurator}>by {playlist.curator}</Text>
                                            <View style={[styles.sourceBadge, { backgroundColor: SOURCE_COLORS[playlist.source] + '22' }]}>
                                                <Text style={[styles.sourceBadgeText, { color: SOURCE_COLORS[playlist.source] }]}>
                                                    {SOURCE_LABELS[playlist.source]}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.playlistDescription}>{playlist.description}</Text>

                                        <View style={styles.userPlaylistActions}>
                                            <Button 
                                                title="Listen" 
                                                onPress={() => handleListen(playlist)} 
                                                variant="primary" 
                                                size="small" 
                                            />
                                            <Button 
                                                title="Save" 
                                                onPress={() => saveCuratedToMyList(playlist)} 
                                                variant="secondary" 
                                                size="small" 
                                            />
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* User's Playlists */}
                        <Text style={styles.listTitle}>Your Playlists</Text>

                        {filteredUser.length > 0 ? (
                            filteredUser.map((playlist) => (
                                <View key={playlist.id} style={styles.playlistCard}>
                                    <View style={styles.playlistHeader}>
                                        <Text style={styles.playlistTitle}>{playlist.title}</Text>
                                        {playlist.duration ? (
                                            <Text style={styles.playlistDuration}>{playlist.duration}</Text>
                                        ) : null}
                                    </View>
                                    <View style={styles.sourceRow}>
                                        {playlist.curator && (
                                            <Text style={styles.playlistCurator}>by {playlist.curator}</Text>
                                        )}
                                        <View style={[styles.sourceBadge, { backgroundColor: SOURCE_COLORS[playlist.source || detectSource(playlist.url)] + '22' }]}>
                                            <Text style={[styles.sourceBadgeText, { color: SOURCE_COLORS[playlist.source || detectSource(playlist.url)] }]}>
                                                {SOURCE_LABELS[playlist.source || detectSource(playlist.url)]}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.playlistDescription}>
                                        {playlist.description}
                                    </Text>

                                    <View style={styles.userPlaylistActions}>
                                        <Button 
                                            title="Listen" 
                                            onPress={() => handleListen(playlist)} 
                                            variant="primary" 
                                            size="small" 
                                        />
                                        <Button 
                                            title="Edit" 
                                            onPress={() => openEditModal(playlist)} 
                                            variant="secondary" 
                                            size="small" 
                                        />
                                        <Button 
                                            title="Delete" 
                                            onPress={() => handleDeletePlaylist(playlist.id, playlist.title)} 
                                            variant="outline" 
                                            size="small" 
                                        />
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyCard}>
                                <Text style={styles.emptyText}>
                                    {activeFilter === 'all' 
                                        ? "You haven't added any playlists yet. Add your favorite Spotify, YouTube, or Apple Music links."
                                        : `No playlists from ${SOURCE_LABELS[activeFilter]} yet.`}
                                </Text>
                                <Button 
                                    title="+ Add Playlist" 
                                    onPress={openAddModal} 
                                    variant="secondary" 
                                    size="medium" 
                                />
                            </View>
                        )}

                        {/* Always show Add button when there are user playlists (regardless of current filter) */}
                        {userPlaylists.length > 0 && (
                            <Button 
                                title="+ Add Another Playlist" 
                                onPress={openAddModal} 
                                variant="secondary" 
                                size="medium" 
                                style={{ alignSelf: 'center', marginTop: 8, marginBottom: 16 }}
                            />
                        )}

                        <Text style={styles.footerNote}>
                            Tip: Use the filters above to quickly find music from your preferred platform. 
                            We recommend audio-focused services (Spotify, Apple, Amazon) over YouTube for fewer visual triggers.
                        </Text>
                    </>
                )}

                {/* Add Playlist Modal */}
                <Modal
                    visible={showAddModal}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => {
                        setShowAddModal(false);
                        setEditingPlaylist(null);
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                            <View style={styles.modalBackground} />
                        </TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>
                                {editingPlaylist ? 'Edit Playlist' : 'Add New Playlist'}
                            </Text>

                            <Text style={styles.inputLabel}>Playlist Title *</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="e.g. My Focus Mix"
                                value={newTitle}
                                onChangeText={setNewTitle}
                                placeholderTextColor={theme.colors.textTertiary}
                                contextMenuHidden={false}
                            />

                            <Text style={styles.inputLabel}>Link (YouTube, Spotify, etc.)</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="https://..."
                                value={newUrl}
                                onChangeText={(text) => {
                                    setNewUrl(text);
                                    // Auto-detect and set if user hasn't overridden
                                    const detected = detectSource(text);
                                    if (newSource === 'other' && detected !== 'other') {
                                        setNewSource(detected);
                                    }
                                }}
                                autoCapitalize="none"
                                keyboardType="url"
                                placeholderTextColor={theme.colors.textTertiary}
                                contextMenuHidden={false}
                            />

                            {/* Source selector - allows override */}
                            <Text style={styles.inputLabel}>Source (detected automatically)</Text>
                            <View style={styles.sourceSelector}>
                                {['spotify', 'youtube', 'apple', 'amazon', 'other'].map((src) => (
                                    <TouchableOpacity
                                        key={src}
                                        style={[
                                            styles.sourceOption,
                                            newSource === src && styles.sourceOptionActive,
                                            { borderColor: SOURCE_COLORS[src] }
                                        ]}
                                        onPress={() => setNewSource(src)}
                                    >
                                        <Text style={[
                                            styles.sourceOptionText,
                                            newSource === src && styles.sourceOptionTextActive
                                        ]}>
                                            {SOURCE_LABELS[src]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Description (optional)</Text>
                            <TextInput
                                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                                placeholder="Why this playlist helps you..."
                                value={newDescription}
                                onChangeText={setNewDescription}
                                multiline
                                placeholderTextColor={theme.colors.textTertiary}
                                contextMenuHidden={false}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={styles.modalCancelButton} 
                                    onPress={() => {
                                        setShowAddModal(false);
                                        setEditingPlaylist(null);
                                    }}
                                >
                                    <Text style={styles.modalCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.modalSaveButton} 
                                    onPress={saveNewPlaylist}
                                >
                                    <Text style={styles.modalSaveText}>
                                        {editingPlaylist ? 'Save Changes' : 'Save Playlist'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* SMART PROTECTION / BARRIERS - real pattern suggestions */}
                {activeSection === 'protect' && (
                    <View style={styles.protectContainer}>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                        </View>
                        <Text style={styles.placeholderTitle}>Smart Protection</Text>
                        <Text style={styles.placeholderText}>
                            Based on your data, here are personalized suggestions for high-risk times. These use your relapse history and reflections.
                        </Text>

                        {/* Dynamic suggestions from data */}
                        <View style={styles.suggestionCard}>
                            <Text style={styles.suggestionTitle}>Top Recommendation</Text>
                            <Text style={styles.suggestionText}>
                                {getProtectRecommendation()}
                            </Text>
                            <Button 
                                title="Open Device Focus Settings" 
                                onPress={openProtectSettings} 
                                variant="primary" 
                                size="medium" 
                            />
                            <Text style={styles.suggestionNote}>
                                This opens your phone's built-in tools with guidance pre-filled in the description.
                            </Text>
                        </View>

                        <Text style={styles.placeholderText}>
                            Gentle reminders can be enabled in Settings. Real auto-locking of other apps is restricted by Apple/Google for privacy — this guided approach puts you in control.
                        </Text>

                        <Button 
                            title="Save This Recommendation" 
                            onPress={saveProtectionRec} 
                            variant="secondary" 
                            size="medium" 
                        />
                    </View>
                )}

                {/* AI COACH (Placeholder) */}
                {activeSection === 'ai' && (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderTitle}>AI Coach</Text>
                        <Text style={styles.placeholderText}>
                            A compassionate chat companion for moments of temptation or reflection.
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Free users get limited messages. Premium unlocks much higher or unlimited access. (Coming soon)
                        </Text>
                    </View>
                )}

                {/* ACCOUNTABILITY PARTNERS (Placeholder) */}
                {activeSection === 'partners' && (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderTitle}>Accountability Partners</Text>
                        <Text style={styles.placeholderText}>
                            Premium-only matching with another serious user for mutual support.
                        </Text>
                        <Text style={styles.placeholderSubtext}>
                            Strong safety features like reporting and guidelines included. (Coming soon)
                        </Text>
                    </View>
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
        marginBottom: 8,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 0,
    },
    sectionScroll: {
        marginBottom: 20,
    },
    sectionContainer: {
        gap: 8,
        paddingHorizontal: 4,
    },
    sectionButton: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
    },
    sectionButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    sectionButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    sectionButtonTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    sectionIntro: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    filterLabel: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 8,
        marginLeft: 4,
    },
    filterScroll: {
        marginBottom: 12,
    },
    filterContainer: {
        gap: 8,
        paddingHorizontal: 4,
    },
    filterChip: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: '#333',
    },
    filterChipActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    filterChipText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    listTitle: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 12,
    },
    playlistCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius,
        padding: 16,
        marginBottom: 12,
    },
    playlistHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    playlistTitle: {
        color: theme.colors.text,
        fontSize: 17,
        fontWeight: '600',
    },
    playlistDuration: {
        color: theme.colors.textTertiary,
        fontSize: 13,
    },
    playlistCurator: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 8,
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    sourceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    sourceBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    playlistDescription: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 21,
        marginBottom: 14,
    },
    listenButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    listenButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    userPlaylistActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: '#3a2a2a',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButtonText: {
        color: '#ffaaaa',
        fontWeight: '600',
        fontSize: 15,
    },
    editButton: {
        backgroundColor: '#3a3a3a',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editButtonText: {
        color: theme.colors.text,
        fontWeight: '600',
        fontSize: 15,
    },
    saveButton: {
        backgroundColor: '#2a3a2a',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonText: {
        color: '#aaffaa',
        fontWeight: '600',
        fontSize: 15,
    },
    emptyCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        marginBottom: 14,
        textAlign: 'center',
    },
    addButton: {
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    addButtonText: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    footerNote: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    placeholderContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius,
        padding: 24,
        marginTop: 20,
        alignItems: 'center',
    },
    placeholderTitle: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
    },
    placeholderText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 8,
    },
    placeholderSubtext: {
        color: theme.colors.textTertiary,
        fontSize: 14,
        textAlign: 'center',
    },
    premiumBadge: {
        alignSelf: 'center',
        backgroundColor: '#3a2f1f',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 999,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#d4af37',
    },
    premiumBadgeText: {
        color: '#d4af37',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
    },
    modalBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputLabel: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        marginBottom: 6,
        marginLeft: 4,
    },
    modalInput: {
        backgroundColor: '#2a2a2a',
        color: theme.colors.text,
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    modalCancelButton: {
        flex: 1,
        backgroundColor: '#3a3a3a',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCancelText: {
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    modalSaveButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalSaveText: {
        color: '#fff',
        fontWeight: '600',
    },
    sourceSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    sourceOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#444',
        backgroundColor: '#2a2a2a',
    },
    sourceOptionActive: {
        backgroundColor: theme.colors.card,
        borderWidth: 2,
    },
    sourceOptionText: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    sourceOptionTextActive: {
        color: theme.colors.text,
        fontWeight: '600',
    },
    // Protect section styles
    protectContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius,
        padding: 20,
        marginTop: 10,
        alignItems: 'center',
    },
    suggestionCard: {
        backgroundColor: '#222',
        borderRadius: 12,
        padding: 16,
        marginVertical: 12,
        width: '100%',
    },
    suggestionTitle: {
        color: theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 8,
    },
    suggestionText: {
        color: theme.colors.text,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    suggestionNote: {
        color: theme.colors.textTertiary,
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
});