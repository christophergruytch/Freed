import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingsScreen() {   // Change name for each file
    return (
        <View style={styles.container}>
            <Text>This is the Settings Screen (placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f0f0f',
    },
});