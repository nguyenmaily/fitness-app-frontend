import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import MainNavigator from './src/navigation/MainNavigator';
import store from './src/store/store';
import * as Linking from 'expo-linking';
import { deepLinkingConfig, handleDeepLink } from './src/utils/deepLinking';

export default function App() {
  useEffect(() => {
    // Xử lý initial URL
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('Initial URL:', initialUrl);
      }
    };

    // Lắng nghe URL mới
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('New URL event:', url);
    });

    getInitialURL();

    return () => {
      // Cleanup subscription
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer
          linking={deepLinkingConfig}
          fallback={<Text>Loading...</Text>}
        >
          <MainNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}