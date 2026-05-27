import React from 'react';
import { View, Keyboard } from 'react-native';

/**
 * Safer version for dismissing keyboard.
 *
 * Note: When you have ScrollViews or FlatLists, prefer using
 * `keyboardShouldPersistTaps="handled"` on those components instead
 * of wrapping large areas with this. Full-screen press handlers
 * can interfere with scrolling gestures.
 */
export default function DismissKeyboard({ children }) {
  return (
    <View
      style={{ flex: 1 }}
      onTouchStart={() => Keyboard.dismiss()}
    >
      {children}
    </View>
  );
}
