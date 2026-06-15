import React from 'react';
import { View } from 'react-native';

/**
 * Safer version for dismissing keyboard.
 *
 * Note: When you have ScrollViews or FlatLists, prefer using
 * `keyboardShouldPersistTaps="handled"` on those components instead
 * of wrapping large areas with this. Full-screen press handlers
 * can interfere with scrolling gestures.
 */
export default function DismissKeyboard({ children }) {
  // Note: This component is deprecated in favor of using
  // keyboardShouldPersistTaps="handled" on ScrollViews/FlatLists
  // and avoiding root-level onTouchStart handlers, which can break
  // native features like copy/paste context menus in TextInputs.
  return (
    <View style={{ flex: 1 }}>
      {children}
    </View>
  );
}
