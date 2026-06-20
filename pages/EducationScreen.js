import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Linking } from 'react-native';
import { theme } from '../theme';
import ScreenContainer from '../components/ScreenContainer';
import useStore from '../store/useStore';
import Button from '../components/Button';

export default function EducationScreen() {
    const { isFaithBased, setIsFaithBased, personalNote, setPersonalNote } = useStore();

    const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'personal', 'resources', 'settings'

    // Personal Note tab draft + success states
    const [personalNoteDraft, setPersonalNoteDraft] = useState(personalNote || '');
    const [showPersonalNoteSuccess, setShowPersonalNoteSuccess] = useState(false);
    const [clearButtonLabel, setClearButtonLabel] = useState('Clear');

    // Keep draft in sync when store value loads or changes
    React.useEffect(() => {
        setPersonalNoteDraft(personalNote || '');
    }, [personalNote]);

    // Autosave (or explicit) - flashSuccess controls whether the Save button shows "✓ Saved"
    const savePersonalNote = (flashSuccess = true) => {
        setPersonalNote(personalNoteDraft);
        if (flashSuccess) {
            setShowPersonalNoteSuccess(true);
            setTimeout(() => setShowPersonalNoteSuccess(false), 1400);
        }
    };

    const clearPersonalNote = () => {
        setPersonalNoteDraft('');
        setPersonalNote('');
        setClearButtonLabel('Cleared');
        setTimeout(() => setClearButtonLabel('Clear'), 1400);
    };

    return (
        <View style={styles.container}>
            <ScreenContainer backgroundColor={theme.colors.background}>
                {/* ==================== PAGE TITLE ==================== */}
                <Text style={styles.title}>Learn</Text>

                {/* Tab Bar - centered horizontal pills (matches filter/section pattern used elsewhere) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabScroll}
                    contentContainerStyle={styles.tabContainer}
                >
                    {[
                        { key: 'learn', label: 'Learning' },
                        { key: 'personal', label: 'Personal Note' },
                        { key: 'resources', label: 'Resources' },
                        { key: 'settings', label: 'Settings' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                activeTab === tab.key && styles.tabButtonActive,
                            ]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === tab.key && styles.tabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ==================== TAB: LEARNING ==================== */}
                {activeTab === 'learn' && (
                    <>
                        <Text style={styles.introText}>
                            Understanding what you're up against — without judgment — is one of the most powerful tools in recovery.
                        </Text>

                        {/* How Addiction Develops */}
                        <Text style={styles.sectionTitle}>How Addiction Develops</Text>
                        <Text style={styles.bodyText}>
                            Pornography addiction often starts small and innocent — maybe out of curiosity, boredom, or a desire to escape stress. Over time, the brain begins to associate these images with quick dopamine hits (a feel-good chemical reward). What starts as occasional viewing can slowly rewire your brain’s reward system, making it crave more intense or frequent stimulation to get the same effect.
                        </Text>
                        <Text style={styles.bodyText}>
                            It’s not a moral failure — it’s biology meeting modern technology. The apps and endless content are literally designed to keep you hooked. Understanding this helps remove shame: your brain was doing what it was wired to do in response to powerful stimuli. The good news is that the brain is also incredibly adaptable. With consistent healthier choices, those old pathways can weaken while new, healthier ones grow stronger.
                        </Text>

                        {/* Common Patterns */}
                        <Text style={styles.sectionTitle}>Common Patterns</Text>
                        <Text style={styles.bodyText}>
                            Most people notice similar patterns when struggling with this. It often happens during specific times — late at night, when stressed, bored, or feeling lonely. Certain apps or situations (scrolling social media, being home alone, after a tough day) become strong triggers.
                        </Text>
                        <Text style={styles.bodyText}>
                            Many describe a cycle: urge → temporary relief → guilt → hiding → repeat. You might also notice it affecting sleep, motivation, relationships, or how you see real people. Recognizing your own patterns is one of the most powerful steps you can take. Once you see the pattern clearly, you can start interrupting it earlier — before the urge gets too strong. That’s exactly why Free'd’s Insights and Temptation Reflection tools exist: to help you spot these patterns and prepare better responses.
                        </Text>

                        {/* Why It’s So Hard to Stop */}
                        <Text style={styles.sectionTitle}>Why It’s So Hard to Stop</Text>
                        <Text style={styles.bodyText}>
                            It feels hard because it’s not just “willpower.” Pornography hijacks the same brain systems involved in survival and bonding. Each session strengthens those neural pathways, making the pull feel almost automatic.
                        </Text>
                        <Text style={styles.bodyText}>
                            On top of that, many people use it to cope with anxiety, loneliness, low self-worth, or boredom. When you try to stop, those underlying feelings don’t disappear — they come rushing back, which is why it often feels like you’re fighting yourself. Add in easy access on your phone and the shame that makes people hide it, and the cycle becomes very difficult to break alone.
                        </Text>
                        <Text style={styles.bodyText}>
                            The important truth is this: struggling doesn’t mean you’re weak. It means you’re up against something powerful. Real change comes not from fighting harder, but from building better tools, support, and habits.
                        </Text>

                        {/* What Recovery Actually Looks Like */}
                        <Text style={styles.sectionTitle}>What Recovery Actually Looks Like</Text>
                        <Text style={styles.bodyText}>
                            Recovery isn’t a straight line from “addicted” to “perfect.” It looks like small, consistent choices over time. Some days you’ll feel strong and free. Other days you might slip — and that’s normal.
                        </Text>
                        <Text style={styles.bodyText}>
                            Progress often shows up as longer streaks, catching urges earlier, feeling less shame when you mess up, and slowly rebuilding trust in yourself. You might notice you’re sleeping better, enjoying real relationships more, and feeling more present in daily life.
                        </Text>
                        <Text style={styles.bodyText}>
                            Recovery is less about never struggling again and more about learning how to respond differently when you do. It’s okay if it takes time. Every person’s journey is different, but the common thread is persistence mixed with self-compassion.
                        </Text>

                        {/* The Role of Setbacks */}
                        <Text style={styles.sectionTitle}>The Role of Setbacks</Text>
                        <Text style={styles.bodyText}>
                            Setbacks are not the end of your progress — they’re part of it. Almost everyone who successfully overcomes this has had multiple slips along the way. The difference is in how you respond.
                        </Text>
                        <Text style={styles.bodyText}>
                            Instead of letting a setback become “I’ve failed, so what’s the point?”, you can treat it as valuable data. What triggered it? What were you feeling? What can you do differently next time? Free'd’s Relapse Logging and Reflections are designed to help turn those moments into learning opportunities rather than proof that you’re broken.
                        </Text>
                        <Text style={styles.bodyText}>
                            A setback doesn’t erase your previous days of freedom. It’s just information to help you build a stronger plan moving forward.
                        </Text>

                        {/* What Helps People Break Free */}
                        <Text style={styles.sectionTitle}>What Helps People Break Free</Text>
                        <Text style={styles.bodyText}>
                            Different things work for different people, but a few approaches show up again and again. Having practical tools ready for tough moments (like your Temptation Reflection screen), building new habits that fill the time and needs the addiction was meeting, finding accountability or community, and addressing the underlying emotions (stress, loneliness, etc.) all make a big difference.
                        </Text>
                        <Text style={styles.bodyText}>
                            Many people also benefit from replacing the habit with healthier outlets — exercise, creative hobbies, music, prayer, or time in nature. Small daily wins compound over time. The most important thing is being kind to yourself on the hard days while staying committed on the good ones.
                        </Text>

                        {/* Mindset Shifts That Matter */}
                        <Text style={styles.sectionTitle}>Mindset Shifts That Matter</Text>
                        <Text style={styles.bodyText}>
                            One of the biggest shifts is moving from “I need to be perfect” to “I just need to keep going.” Another is seeing yourself as someone who is growing rather than someone who is broken.
                        </Text>
                        <Text style={styles.bodyText}>
                            Many people also shift from shame (“I’m disgusting”) to compassion (“I’m struggling and I’m working on it”). Understanding that urges are temporary waves — they rise, peak, and fall — can reduce their power. Finally, focusing on your “why” (the life you want to live, the person you want to become) is often more motivating than just trying to avoid something bad.
                        </Text>
                        <Text style={styles.bodyText}>
                            These mindset changes don’t happen overnight, but they make everything else easier.
                        </Text>

                        {/* There Is Hope */}
                        <Text style={styles.sectionTitle}>There Is Hope</Text>
                        <Text style={styles.bodyText}>
                            No matter how long you’ve struggled or how many times you’ve tried before, real change is possible. Thousands of people have broken free from this and gone on to live full, meaningful lives.
                        </Text>
                        <Text style={styles.bodyText}>
                            Your brain can heal. Your confidence can return. Relationships can be rebuilt. Every single day you choose freedom — even imperfectly — is moving you forward.
                        </Text>
                        <Text style={styles.bodyText}>
                            You are not alone in this, and it is never too late to start again. Hope isn’t about pretending it will be easy. It’s about believing that the effort is worth it, and that you are capable of more than you feel in your weakest moments.
                        </Text>

                        {/* Teaser to Resources */}
                        <View style={styles.resourcesTeaser}>
                            <Text style={styles.resourcesTeaserText}>
                                Looking for practical tools and further reading? Check the <Text style={{ fontWeight: '600' }}>Resources</Text> tab.
                            </Text>
                        </View>
                    </>
                )}

                {/* ==================== TAB: PERSONAL NOTE ==================== */}
                {activeTab === 'personal' && (
                    <>
                        <Text style={styles.sectionTitle}>Personal Note</Text>

                        <Text style={styles.bodyText}>
                            Write anything here that helps you — a reminder of why you started, a verse or quote that grounds you, or a note to your future self on tough days. This is private and saved on your device.
                        </Text>

                        <TextInput
                            style={styles.personalNoteInput}
                            multiline
                            placeholder="Your note to yourself..."
                            placeholderTextColor={theme.colors.textTertiary}
                            value={personalNoteDraft}
                            onChangeText={setPersonalNoteDraft}
                            onBlur={() => savePersonalNote(false)}
                            contextMenuHidden={false}
                            textAlignVertical="top"
                        />

                        <View style={styles.personalNoteActions}>
                            <Button
                                title="Save"
                                onPress={() => savePersonalNote(true)}
                                success={showPersonalNoteSuccess}
                                variant="primary"
                                size="small"
                                style={{ flex: 1, marginRight: 8 }}
                            />
                            <Button
                                title={clearButtonLabel}
                                onPress={clearPersonalNote}
                                variant="outline"
                                size="small"
                                style={{ flex: 1 }}
                            />
                        </View>

                        <Text style={styles.personalNoteHint}>
                            Autosaves when you tap away. Clear removes it permanently from this device.
                        </Text>
                    </>
                )}

                {/* ==================== TAB: RESOURCES ==================== */}
                {activeTab === 'resources' && (
                    <View style={styles.resourcesContainer}>
                        <Text style={styles.sectionTitle}>Resources</Text>

                        <Text style={styles.bodyText}>
                            Here are a few starting points that many people have found helpful. Take what serves you.
                        </Text>

                        {/* Resource 1 */}
                        <View style={styles.resourceCard}>
                            <Text style={styles.resourceTitle}>Your Brain on Porn</Text>
                            <Text style={styles.resourceDesc}>Gary Wilson's book and site explaining the science of internet porn's effect on the brain.</Text>
                            <Button
                                title="Visit Site"
                                onPress={() => Linking.openURL('https://www.yourbrainonporn.com')}
                                variant="secondary"
                                size="small"
                            />
                        </View>

                        {/* Resource 2 */}
                        <View style={styles.resourceCard}>
                            <Text style={styles.resourceTitle}>Fight the New Drug</Text>
                            <Text style={styles.resourceDesc}>A non-religious, research-based organization raising awareness about pornography's harms.</Text>
                            <Button
                                title="Visit Site"
                                onPress={() => Linking.openURL('https://fightthenewdrug.org')}
                                variant="secondary"
                                size="small"
                            />
                        </View>

                        {/* Resource 3 */}
                        <View style={styles.resourceCard}>
                            <Text style={styles.resourceTitle}>Reboot Nation</Text>
                            <Text style={styles.resourceDesc}>A supportive online community and forum for people rebooting from pornography and compulsive sexual behavior.</Text>
                            <Button
                                title="Visit Forum"
                                onPress={() => Linking.openURL('https://rebootnation.org')}
                                variant="secondary"
                                size="small"
                            />
                        </View>

                        <Text style={[styles.bodyText, { marginTop: 24, fontSize: 14, color: theme.colors.textTertiary }]}>
                            More books, podcasts, and tools will be added here over time.
                        </Text>
                    </View>
                )}

                {/* ==================== TAB: SETTINGS (quick access) */}
                {activeTab === 'settings' && (
                    <View style={styles.settingsContainer}>
                        <Text style={styles.sectionTitle}>Quick Settings</Text>

                        <View style={styles.toggleRow}>
                            <Text style={styles.toggleLabel}>Faith-Based Encouragement</Text>
                            <Switch
                                value={isFaithBased}
                                onValueChange={setIsFaithBased}
                                trackColor={{ false: '#767577', true: theme.colors.primary }}
                            />
                        </View>

                        <Text style={styles.bodyText}>
                            For notifications, data tools, and all other settings, open your Profile from the top-left avatar on the Home screen.
                        </Text>

                        <Button
                            title="Open Full Settings"
                            onPress={() => Alert.alert(
                                "Full Settings",
                                "Open your Profile (top-left avatar on Home) then tap the settings icon for notifications, data management, and more."
                            )}
                            variant="secondary"
                        />
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
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        color: theme.colors.primary,
        marginTop: 25,
        marginBottom: 10,
    },
    bodyText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    subheading: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    introText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    motivation: {
        color: theme.colors.textSecondary,
        textAlign: 'center',
        fontSize: 17,
        lineHeight: 26,
        fontStyle: 'italic',
    },
    closingContainer: {
        marginTop: 30,
        marginBottom: 40,
        padding: 20,
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius,
    },
    /* Top tab selector - horizontal centered pills (balanced even with "Personal Note") */
    tabScroll: {
        marginBottom: 20,
    },
    tabContainer: {
        gap: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: theme.colors.card,
    },
    tabButtonActive: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: '600',
    },

    /* Personal Note input */
    personalNoteInput: {
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        fontSize: 16,
        lineHeight: 24,
        padding: 16,
        borderRadius: theme.spacing.radius,
        minHeight: 160,
        textAlignVertical: 'top',
    },
    personalNoteActions: {
        flexDirection: 'row',
        marginTop: 12,
    },
    personalNoteHint: {
        color: theme.colors.textTertiary,
        fontSize: 13,
        marginTop: 12,
        textAlign: 'center',
    },

    /* Resources */
    resourcesContainer: {
        paddingBottom: 40,
    },
    resourceCard: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginBottom: 14,
    },
    resourceTitle: {
        color: theme.colors.text,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
    },
    resourceDesc: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 14,
    },

    resourcesTeaser: {
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: theme.spacing.radius,
        marginTop: 24,
    },
    resourcesTeaserText: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
    },

    /* Settings sub-tab */
    settingsContainer: {
        backgroundColor: theme.colors.card,
        padding: 18,
        borderRadius: theme.spacing.radius,
        marginTop: 10,
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
});