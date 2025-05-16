import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { feedbackAPI } from '../../services/api';

export const fetchUserFeedback = createAsyncThunk(
  'feedback/fetchUserFeedback',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.getUserFeedback(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendFeedback = createAsyncThunk(
  'feedback/sendFeedback',
  async (feedbackData, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.sendFeedback(feedbackData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const sendMediaForFeedback = createAsyncThunk(
  'feedback/sendMediaForFeedback',
  async (mediaData, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.sendMediaForFeedback(mediaData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const markFeedbackAsRead = createAsyncThunk(
  'feedback/markFeedbackAsRead',
  async (feedbackId, { rejectWithValue }) => {
    try {
      const response = await feedbackAPI.markFeedbackAsRead(feedbackId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState: {
    feedback: [],
    loading: false,
    error: null,
    sendingStatus: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Xử lý fetchUserFeedback
      .addCase(fetchUserFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedback = action.payload;
        state.error = null;
      })
      .addCase(fetchUserFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý sendFeedback
      .addCase(sendFeedback.pending, (state) => {
        state.sendingStatus = 'loading';
      })
      .addCase(sendFeedback.fulfilled, (state, action) => {
        state.sendingStatus = 'succeeded';
        state.feedback.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendFeedback.rejected, (state, action) => {
        state.sendingStatus = 'failed';
        state.error = action.payload;
      })
      // Xử lý sendMediaForFeedback
      .addCase(sendMediaForFeedback.pending, (state) => {
        state.sendingStatus = 'loading';
      })
      .addCase(sendMediaForFeedback.fulfilled, (state, action) => {
        state.sendingStatus = 'succeeded';
        state.feedback.unshift(action.payload);
        state.error = null;
      })
      .addCase(sendMediaForFeedback.rejected, (state, action) => {
        state.sendingStatus = 'failed';
        state.error = action.payload;
      })
      // Xử lý markFeedbackAsRead
      .addCase(markFeedbackAsRead.fulfilled, (state, action) => {
        const index = state.feedback.findIndex(fb => fb.id === action.payload.id);
        if (index !== -1) {
          state.feedback[index].is_read = true;
        }
      });
  },
});

export default feedbackSlice.reducer;