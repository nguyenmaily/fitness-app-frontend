import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { login } from '../../store/reducers/authSlice';
import COLORS from '../../constants/colors';
import { useSelector } from 'react-redux';

const PlaceholderLoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('nguyenmaily140703@gmail.com');
  const [password, setPassword] = useState('140703');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

   // Bước 2.1: Thêm useEffect để chuyển hướng
  useEffect(() => {
    if (user) {
      console.log('Phát hiện user đã đăng nhập. Chuyển hướng...'); // 🚨
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTab' }]
      });
    }
  }, [user]); // Khi user thay đổi sẽ chạy lại effect này

  const handleLogin = async () => {
    if (!validateInput()) return;
    setLoading(true);
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      await dispatch(getUserProfile(result.user.id)).unwrap();
       navigation.reset({
      index: 0,
      routes: [{ name: 'MainTab' }],
    });
    } catch (error) {
      Alert.alert('Đăng nhập thất bại', error || 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const validateInput = () => {
    if (!email.includes('@')) {
      Alert.alert('Email không hợp lệ');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  return (
    <LinearGradient colors={[COLORS.white, COLORS.border]} style={styles.container}>
      {/* Logo và tên app */}
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

      {/* Form đăng nhập */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={COLORS.gray}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor={COLORS.gray}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Nút đăng nhập */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.buttonText}>Đăng nhập</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Liên kết đăng ký */}
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

// Styles giữ nguyên như thiết kế ban đầu
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
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
  input: {
    width: '100%',
    height: 48,
    borderColor: COLORS.gray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    marginTop: 10,
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
  signupText: {
    color: COLORS.primary,
    marginTop: 16,
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default PlaceholderLoginScreen;
