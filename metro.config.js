const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Export wrapped config with NativeWind support
module.exports = withNativeWind(config, { input: './global.css' });