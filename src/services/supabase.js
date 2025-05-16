import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// Tạo một async storage adapter cho Supabase với Expo SecureStore
const ExpoSecureStoreAdapter = {
  getItem: key => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: key => SecureStore.deleteItemAsync(key),
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

export default supabase;