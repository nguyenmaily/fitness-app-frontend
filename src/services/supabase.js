import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// Tạo một async storage adapter cho Supabase với Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    const value = await SecureStore.getItemAsync(key);
    console.log('Lấy token từ SecureStore:', key, value); // 🚨
    return value;
  },
  setItem: async (key, value) => {
    console.log('Lưu token vào SecureStore:', key, value); // 🚨
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    console.log('Xóa token khỏi SecureStore:', key); // 🚨
    await SecureStore.deleteItemAsync(key);
  },
};


const supabaseUrl = 'https://wqmhglkddzihhyxwekho.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbWhnbGtkZHppaGh5eHdla2hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1NDM5MjksImV4cCI6MjA2MjExOTkyOX0.6IujPYr5dmL3iNCaRnXg9X2Qmgvaw0P9juRH2i86Xis';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// // 1.1. In ra URL và Key để kiểm tra
// console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
// console.log('SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

// // 1.2. Test kết nối Supabase ngay trong file này
// const testSupabaseConnection = async () => {
//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email: 'nguyenmaily140703@gmail.com',
//       password: '140703'
//     });
//     console.log('Kết quả test kết nối:', { data, error });
//   } catch (e) {
//     console.error('Lỗi test kết nối Supabase:', e);
//   }
// };

// testSupabaseConnection(); // Chạy test ngay khi khởi động app


// const testAuth = async () => {
//   try {
//     // Test đăng nhập với credentials đúng
//     const { data, error } = await supabase.auth.signInWithPassword({
//       email: 'nguyenmaily140703@gmai.com',
//       password: '140703'
//     });
    
//     if (error) throw error;
//     console.log('Đăng nhập thành công:', data);
    
//     // Test lấy thông tin user
//     const { data: userData } = await supabase.auth.getUser();
//     console.log('Thông tin user:', userData);
    
//   } catch (error) {
//     console.error('Lỗi:', error);
//   }
// };

// testAuth();

export default supabase;