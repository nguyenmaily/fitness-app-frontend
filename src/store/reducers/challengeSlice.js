import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { challengeAPI } from '../../services/api';

export const fetchChallenges = createAsyncThunk(
  'challenges/fetchChallenges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getChallenges();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const joinChallenge = createAsyncThunk(
  'challenges/joinChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.joinChallenge(challengeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchChallengeLeaderboard = createAsyncThunk(
  'challenges/fetchChallengeLeaderboard',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getChallengeLeaderboard(challengeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchUserBadges = createAsyncThunk(
  'challenges/fetchUserBadges',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await challengeAPI.getUserBadges(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const challengeSlice = createSlice({
  name: 'challenges',
  initialState: {
    challenges: [],
    leaderboard: [],
    userChallenges: [],
    badges: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchChallenges
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
        state.error = null;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý joinChallenge
      .addCase(joinChallenge.pending, (state) => {
        state.loading = true;
      })
      .addCase(joinChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.userChallenges.push(action.payload);
        state.error = null;
      })
      .addCase(joinChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchChallengeLeaderboard
      .addCase(fetchChallengeLeaderboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChallengeLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.leaderboard = action.payload;
        state.error = null;
      })
      .addCase(fetchChallengeLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchUserBadges
      .addCase(fetchUserBadges.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload;
        state.error = null;
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default challengeSlice.reducer;