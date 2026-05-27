import React from 'react';
import { ScrollView, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * ScreenContainer
 *
 * A reusable wrapper that gives every screen consistent behavior:
 * - Automatically adds bottom padding so content is never hidden under the tab bar.
 * - Makes the screen scrollable by default (feels like a real app).
 * - Plays nicely with keyboard dismissal.
 *
 * Usage:
 *   <ScreenContainer>
 *     <YourContent />
 *   </ScreenContainer>
 *
 * If you don't want scrolling on a particular screen:
 *   <ScreenContainer scrollable={false}>
 *     ...
 *   </ScreenContainer>
 */
export default function ScreenContainer({
  children,
  scrollable = true,
  contentContainerStyle = {},
  style = {},
  backgroundColor,
  ...props
}) {
  const insets = useSafeAreaInsets();

  // Generous bottom padding to clear the tab bar + safe area on all devices
  const bottomPadding = insets.bottom + 90;

  const containerStyle = backgroundColor ? { backgroundColor } : {};

  if (!scrollable) {
    return (
      <View
        style={[
          { flex: 1, paddingBottom: bottomPadding },
          containerStyle,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={[{ flex: 1 }, containerStyle, style]}
      contentContainerStyle={[
        { paddingBottom: bottomPadding },
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
