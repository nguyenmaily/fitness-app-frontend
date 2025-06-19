import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../services/supabase';
import * as SecureStore from 'expo-secure-store';

// Selectors
// export const selectCurrentUserId = (state) => state.auth.user?.id || null;
// export const selectIsAuthenticated = (state) => !!state.auth.user;

// Async Thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Bước 1.1: Gọi API đăng nhập
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password.trim()
      });

      // Bước 1.2: Nếu có lỗi từ Supabase
      if (error) {
        console.error('Lỗi từ Supabase:', error); // 🚨 Log lỗi
        throw error;
      }

      // Bước 1.3: Lưu token vào SecureStore
      await SecureStore.setItemAsync('supabase_token', data.session.access_token);
      
      // Bước 1.4: Trả về dữ liệu đúng cấu trúc
      return {
        user: data.user,
        session: data.session
      };

    } catch (error) {
      // Bước 1.5: Xử lý lỗi
      console.error('Lỗi trong quá trình đăng nhập:', error);
      return rejectWithValue(error.message);
    }
  }
);


export const checkSession = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data?.session) {
        dispatch(getUserProfile(data.session.user.id));
        return data;
      }
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('supabase_token');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const initialState = {
  user: null,
  session: null,
  profile: null,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.session = null;
      state.profile = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(checkSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload?.session?.user || null;
        state.session = action.payload?.session || null;
      })
      .addCase(checkSession.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
        state.session = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.profile = null;
        state.status = 'idle';
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
