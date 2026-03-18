import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { StatusBar, StyleSheet } from 'react-native';
import * as SystemUI from 'expo-system-ui';  // Optional for Expo SDK 50+
import store from './app/store';
import MainNavigator from './MainNavigator';

// Set the background color for system UI (Optional but recommended)
SystemUI.setBackgroundColorAsync('#006400');

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar backgroundColor="#006400" translucent barStyle="light-content" />
        <Provider store={store}>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
