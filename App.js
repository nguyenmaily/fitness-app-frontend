import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import ErrorBoundary from './src/components/ErrorBoundary';
import RootNavigator from './src/navigation/MainNavigator';
import store from './src/store/store';
import performanceMonitor from './src/services/performanceMonitor';
import analytics from '@react-native-firebase/analytics';
import { useDispatch, useSelector } from 'react-redux';
import { checkSession } from './src/store/reducers/authSlice';

// Bật chế độ debug cho Analytics trong môi trường dev
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(true);
  analytics().logEvent('debug_mode', {
    environment: 'development',
    enabled: true,
  });
  console.log('Analytics debug mode enabled in development environment');
}

export default function App() {

  console.log('Redux store state:', store.getState());

  useEffect(() => {
    // Bắt đầu theo dõi hiệu suất ứng dụng
    const cleanup = performanceMonitor.start();

    return cleanup;
  }, []);

  return (
    <Provider store={store}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NavigationContainer
             onStateChange={(state) => {
              // Theo dõi màn hình hiện tại
              const currentRouteName = getActiveRouteName(state);
              if (currentRouteName) {
                performanceMonitor.trackScreenTime(currentRouteName);
              }
            }}
          >
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </Provider>
  );
}

// Hàm lấy tên màn hình hiện tại từ navigation state
function getActiveRouteName(state) {
  if (!state || !state.routes) return null;
  
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  
  return route.name;
}