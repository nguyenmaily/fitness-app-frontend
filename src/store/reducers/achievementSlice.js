import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { achievementAPI } from '../../services/api';

export const fetchUserAchievements = createAsyncThunk(
  'achievements/fetchUserAchievements',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await achievementAPI.getUserAchievements(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createAchievement = createAsyncThunk(
  'achievements/createAchievement',
  async (achievementData, { rejectWithValue }) => {
    try {
      const response = await achievementAPI.createAchievement(achievementData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const shareAchievement = createAsyncThunk(
  'achievements/shareAchievement',
  async (shareData, { rejectWithValue }) => {
    try {
      const response = await achievementAPI.shareAchievement(shareData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const achievementSlice = createSlice({
  name: 'achievements',
  initialState: {
    achievements: [],
    loading: false,
    error: null,
    sharingStatus: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchUserAchievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements = action.payload;
        state.error = null;
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý createAchievement
      .addCase(createAchievement.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAchievement.fulfilled, (state, action) => {
        state.loading = false;
        state.achievements.unshift(action.payload);
        state.error = null;
      })
      .addCase(createAchievement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý shareAchievement
      .addCase(shareAchievement.pending, (state) => {
        state.sharingStatus = 'loading';
      })
      .addCase(shareAchievement.fulfilled, (state, action) => {
        state.sharingStatus = 'succeeded';
        const index = state.achievements.findIndex(ach => ach.id === action.payload.id);
        if (index !== -1) {
          state.achievements[index] = action.payload;
        }
      })
      .addCase(shareAchievement.rejected, (state, action) => {
        state.sharingStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export default achievementSlice.reducer;