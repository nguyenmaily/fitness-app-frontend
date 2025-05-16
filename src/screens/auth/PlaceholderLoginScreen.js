import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../../constants/colors';

const PlaceholderLoginScreen = ({ navigation }) => {
  // Logo component thay vì hình ảnh
  const Logo = () => (
    <View style={styles.logoContainer}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.logoBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.logoText}>X</Text>
      </LinearGradient>
      <Text style={styles.appName}>Fitness X</Text>
    </View>
  );
  
  return (
    <LinearGradient
      colors={[COLORS.white, COLORS.border]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.content}>
        <Logo />
        
        <Text style={styles.title}>Xin chào!</Text>
        <Text style={styles.message}>
          Màn hình đăng nhập đang được phát triển. Tạm thời bạn có thể truy cập trực tiếp vào ứng dụng.
        </Text>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('MainTab')}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Vào ứng dụng</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Đang phát triển bởi Fitness X Team
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 30,
    color: COLORS.darkGray,
    fontSize: 16,
    lineHeight: 24,
  },
  loginButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
});

export default PlaceholderLoginScreen;