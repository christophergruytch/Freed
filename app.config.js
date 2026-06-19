const base = require('./app.json').expo;

const variant = process.env.EXPO_PUBLIC_APP_VARIANT || 'preview';
const isDevelopment = variant === 'development' || variant === 'development-simulator';

const bundleIdentifier = isDevelopment
  ? 'com.christophergruytch.freedapp.dev'
  : 'com.christophergruytch.freedapp';

const appName = isDevelopment ? "Free'd Dev" : "Free'd";

module.exports = {
  ...base,
  name: appName,
  scheme: isDevelopment ? 'freed-dev' : 'freed',
  ios: {
    ...base.ios,
    bundleIdentifier,
    displayName: appName,
    infoPlist: {
      ...(base.ios && base.ios.infoPlist ? base.ios.infoPlist : {}),
      CFBundleDisplayName: appName,
      CFBundleName: appName,
    },
  },
  android: {
    ...base.android,
    package: bundleIdentifier,
    label: appName,
  },
};
