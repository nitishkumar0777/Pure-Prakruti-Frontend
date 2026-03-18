module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin"
    ],
  };
};


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       "react-native-worklets/plugin",   // needed if you're using Worklets explicitly
//       "react-native-reanimated/plugin", // MUST be last for Reanimated
//     ],
//   };
// };


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       "react-native-reanimated/plugin", // needed for Reanimated
//       "react-native-worklets/plugin",   // needed if you're using Worklets explicitly
//     ],
//   };
// };


// // babel.config.js
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ["babel-preset-expo"],
//     plugins: [
//       "react-native-worklets/plugin", // ✅ now works because we installed the package
//     ],
//   };
// };
