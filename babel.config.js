module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated plugin enabled now that we are on Development Builds (not Expo Go).
    // This unlocks smooth 60fps animations, worklets, and advanced gestures.
    plugins: ['react-native-reanimated/plugin'],
  };
};
