import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { theme } from '../theme';

const ICONS = {
  Home: 'home',
  Journal: 'book',
  Insights: 'trending-up',
  Support: 'users',
  Learn: 'book-open',
};

const PILL_WIDTH = 62;
const PILL_HEIGHT = 52;

export default function CustomTabBar({ state, descriptors, navigation }) {
  const { routes, index: activeIndex } = state;
  const [barWidth, setBarWidth] = useState(0);

  // Reanimated shared value for smooth pill animation
  const translateX = useSharedValue(0);
  const focusScale = useSharedValue(1); // extra pop on the active tab

  // Calculate tab width dynamically
  const tabWidth = barWidth > 0 ? barWidth / routes.length : 0;

  // Update pill position + active tab "pop" when active tab changes
  React.useEffect(() => {
    if (tabWidth > 0) {
      const targetX = activeIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2;
      translateX.value = withSpring(targetX, {
        damping: 16,
        stiffness: 140,
        mass: 0.6,
      });
      // Use withSequence for the pop + settle so we don't rely on setTimeout
      // (avoids mutating shared value from a timer that can outlive renders / cause frozen ref.current errors)
      focusScale.value = withSequence(
        withSpring(1.08, { damping: 14, stiffness: 180 }),
        withSpring(1.02, { damping: 20, stiffness: 160 })
      );
    }
  }, [activeIndex, tabWidth]);

  const pillAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const activeTabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: focusScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View 
        style={styles.tabBar} 
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {/* Animated Pill Background (now using Reanimated) */}
        {barWidth > 0 && (
          <Animated.View style={[styles.pill, pillAnimatedStyle]} />
        )}

        {routes.map((route, idx) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;
          const isFocused = activeIndex === idx;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Animated.View 
                style={[
                  isFocused ? activeTabStyle : undefined,
                  { alignItems: 'center' }
                ]}
              >
                <Feather
                  name={ICONS[route.name] || 'circle'}
                  size={22}
                  color={isFocused ? '#fff' : theme.colors.textSecondary}
                />
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 0,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: 20,
    borderRadius: 30,
    height: 64,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pill: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    top: 6,
    width: 62,
    height: 52,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    height: '100%',
    paddingTop: 4,
  },
  labelActive: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 3,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  labelInactive: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
