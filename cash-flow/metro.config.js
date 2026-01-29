// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add path alias support for @/ imports
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': __dirname,
  },
};

module.exports = config;
