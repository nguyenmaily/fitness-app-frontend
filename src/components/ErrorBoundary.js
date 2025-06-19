import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import analyticsService from '../services/analyticsService';
import COLORS from '../constants/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log lỗi với Firebase Analytics
    analyticsService.logError(
      'react_error_boundary',
      error.message || 'Unknown React error'
    );
  }

  handleRestart = () => {
    // Khởi động lại ứng dụng hoặc chuyển về màn hình chính
    analyticsService.logEvent('app_restart_after_error');
    this.setState({ hasError: false });
    this.props.onRestart && this.props.onRestart();
  };

   render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons name="alert-circle" size={64} color={COLORS.error} />
          <Text style={styles.title}>Đã xảy ra lỗi</Text>
          <Text style={styles.message}>
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
          </Text>
          <Button 
            title="Khởi động lại" 
            onPress={this.handleRestart} 
            color={COLORS.primary}
          />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ErrorBoundary;