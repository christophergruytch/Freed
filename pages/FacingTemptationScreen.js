// pages/FacingTemptationScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { theme } from '../theme';
import ScreenContainer from '../components/ScreenContainer';
import useStore from '../store/useStore';
import Button from '../components/Button';

const PROMPTS = [
  "How are you feeling right now?",
  "What thoughts are going through your head?",
  "What might help you choose freedom right now?",
  "Any other thoughts you'd like to capture?"
];

export default function FacingTemptationScreen({ onClose }) {
    const { addTemptationReflection } = useStore();

    const [answers, setAnswers] = useState(Array(PROMPTS.length).fill(''));
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiResponse, setAiResponse] = useState('');

    const updateAnswer = (index, text) => {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    };

    const hasAnyAnswer = answers.some(a => a.trim().length > 0);

    const generateAiResponse = () => {
        const feeling = answers[0].trim() || "a bit overwhelmed";
        const thoughts = answers[1].trim() || "the usual pull";
        const help = answers[2].trim() || "taking a breath and remembering why I started";
        const other = answers[3].trim() || "";

        let response = `Thank you for pausing and sharing. I hear that you're feeling ${feeling.toLowerCase()} right now — that's valid, and naming it takes courage. `;

        response += `The thoughts about ${thoughts.toLowerCase()} sound really intense. It's powerful that you're noticing them instead of letting them pull you in. `;

        response += `You mentioned ${help.toLowerCase()} as something that might help — lean into that. It's a real tool you've identified. `;

        if (other) {
            response += `And the extra thoughts about ${other.toLowerCase()} show you're reflecting deeply. `;
        }

        response += `Remember, this urge will pass. You've chosen freedom before, and you can again. One breath at a time. I'm proud of you for being here. What small step feels possible right now?`;

        return response;
    };

    const handleTalkToAi = () => {
        if (!hasAnyAnswer) {
            Alert.alert("Add some thoughts", "Please fill in at least one prompt so the AI can respond meaningfully.");
            return;
        }
        const response = generateAiResponse();
        setAiResponse(response);
        setShowAiModal(true);
    };

    const handleSaveReflection = () => {
        if (!hasAnyAnswer) {
            Alert.alert("Nothing to save", "Please answer at least one prompt before saving.");
            return;
        }

        const reflection = {
            prompts: PROMPTS,
            answers: [...answers],
            timestamp: new Date().toISOString()
        };

        addTemptationReflection(reflection);
        Alert.alert("Reflection Saved", "Your thoughts have been saved to Insights & History. Great job pausing.", [
            { text: "OK", onPress: onClose }
        ]);
    };

    const handleChoseFreedom = () => {
        Alert.alert(
            "You Chose Freedom",
            "That pause was powerful. Every time you choose to reflect instead of react, you're building strength. Keep going — one moment at a time.",
            [{ text: "Thank you", onPress: onClose }]
        );
    };

    const closeAiModal = () => {
        setShowAiModal(false);
    };

    return (
        <View style={styles.container}>
            <ScreenContainer backgroundColor={theme.colors.background}>
                <Text style={styles.title}>Pause & Reflect</Text>
                <Text style={styles.subtitle}>
                    You're facing a tough moment. That's okay. Take your time with these questions — there's no wrong way to answer.
                </Text>

                {PROMPTS.map((prompt, index) => (
                    <View key={index} style={styles.promptContainer}>
                        <Text style={styles.promptLabel}>{prompt}</Text>
                        <TextInput
                            style={styles.promptInput}
                            placeholder="Your thoughts..."
                            value={answers[index]}
                            onChangeText={(text) => updateAnswer(index, text)}
                            multiline
                            placeholderTextColor={theme.colors.textTertiary}
                            contextMenuHidden={false}
                        />
                    </View>
                ))}

                <Text style={styles.encourageText}>
                    You're doing the hard work just by pausing and reflecting. These answers don't have to be perfect.
                </Text>

                <View style={styles.buttonContainer}>
                    <Button 
                        title="Talk to AI Coach" 
                        onPress={handleTalkToAi} 
                        variant="accent" 
                        size="large" 
                    />
                    <Button 
                        title="Save Reflection" 
                        onPress={handleSaveReflection} 
                        variant="primary" 
                        size="large" 
                    />
                    <Button 
                        title="I Chose Freedom" 
                        onPress={handleChoseFreedom} 
                        variant="secondary" 
                        size="large" 
                    />
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
            </ScreenContainer>

            {/* AI Coach Modal (stub with personalized response) */}
            <Modal
                visible={showAiModal}
                transparent={true}
                animationType="slide"
                onRequestClose={closeAiModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>AI Coach Response</Text>
                        <ScrollView style={styles.aiScroll}>
                            <Text style={styles.aiContextLabel}>Your reflections:</Text>
                            {PROMPTS.map((prompt, i) => (
                                answers[i].trim() && (
                                    <View key={i} style={styles.aiContextItem}>
                                        <Text style={styles.aiPrompt}>{prompt}</Text>
                                        <Text style={styles.aiAnswer}>{answers[i]}</Text>
                                    </View>
                                )
                            ))}
                            <Text style={styles.aiResponseLabel}>Response:</Text>
                            <Text style={styles.aiResponse}>{aiResponse}</Text>
                        </ScrollView>
                        <TouchableOpacity style={styles.modalCloseButton} onPress={closeAiModal}>
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        fontSize: 28,
    },
    subtitle: {
        color: theme.colors.textSecondary,
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
        lineHeight: 22,
    },
    promptContainer: {
        marginBottom: 16,
    },
    promptLabel: {
        color: theme.colors.text,
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 6,
        marginLeft: 4,
    },
    promptInput: {
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        padding: 14,
        borderRadius: 12,
        minHeight: 70,
        textAlignVertical: 'top',
    },
    encourageText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        fontStyle: 'italic',
        paddingHorizontal: 10,
    },
    buttonContainer: {
        marginTop: 10,
        gap: 10,
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiButton: {
        backgroundColor: theme.colors.accent,
    },
    saveButton: {
        backgroundColor: theme.colors.primary,
    },
    freedomButton: {
        backgroundColor: '#4a7c59', // calm green
    },
    actionButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 24,
        alignSelf: 'center',
    },
    closeButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    },
    // AI Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        color: theme.colors.text,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 16,
    },
    aiScroll: {
        maxHeight: 400,
    },
    aiContextLabel: {
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    aiContextItem: {
        marginBottom: 12,
    },
    aiPrompt: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: 2,
    },
    aiAnswer: {
        color: theme.colors.text,
        fontSize: 15,
        marginBottom: 8,
    },
    aiResponseLabel: {
        color: theme.colors.primary,
        fontWeight: '600',
        marginTop: 12,
        marginBottom: 8,
    },
    aiResponse: {
        color: theme.colors.text,
        fontSize: 15,
        lineHeight: 22,
    },
    modalCloseButton: {
        marginTop: 16,
        backgroundColor: '#444',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseText: {
        color: theme.colors.text,
        fontWeight: '600',
    },
});