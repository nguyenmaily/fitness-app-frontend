import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { musicAPI } from '../../services/api';

export const fetchPlaylists = createAsyncThunk(
  'music/fetchPlaylists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await musicAPI.getPlaylists();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchPlaylistsByWorkoutType = createAsyncThunk(
  'music/fetchPlaylistsByWorkoutType',
  async (workoutType, { rejectWithValue }) => {
    try {
      const response = await musicAPI.getPlaylistsByWorkoutType(workoutType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const createPlaylist = createAsyncThunk(
  'music/createPlaylist',
  async (playlistData, { rejectWithValue }) => {
    try {
      const response = await musicAPI.createPlaylist(playlistData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const searchSpotifyTracks = createAsyncThunk(
  'music/searchSpotifyTracks',
  async (query, { rejectWithValue }) => {
    try {
      const response = await musicAPI.searchSpotifyTracks(query);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateMusicPreferences = createAsyncThunk(
  'music/updateMusicPreferences',
  async (preferencesData, { rejectWithValue }) => {
    try {
      const response = await musicAPI.updateMusicPreferences(preferencesData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const musicSlice = createSlice({
  name: 'music',
  initialState: {
    playlists: [],
    searchResults: [],
    currentPlaylist: null,
    currentTrack: null,
    playing: false,
    loading: false,
    error: null,
    userPreferences: null,
  },
  reducers: {
    setCurrentPlaylist: (state, action) => {
      state.currentPlaylist = action.payload;
    },
    setCurrentTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    setPlaying: (state, action) => {
      state.playing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchPlaylists
      .addCase(fetchPlaylists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
        state.error = null;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchPlaylistsByWorkoutType
      .addCase(fetchPlaylistsByWorkoutType.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlaylistsByWorkoutType.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists = action.payload;
        state.error = null;
      })
      .addCase(fetchPlaylistsByWorkoutType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý createPlaylist
      .addCase(createPlaylist.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.loading = false;
        state.playlists.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý searchSpotifyTracks
      .addCase(searchSpotifyTracks.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchSpotifyTracks.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
        state.error = null;
      })
      .addCase(searchSpotifyTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý updateMusicPreferences
      .addCase(updateMusicPreferences.fulfilled, (state, action) => {
        state.userPreferences = action.payload;
      });
  },
});

export const { setCurrentPlaylist, setCurrentTrack, setPlaying } = musicSlice.actions;
export default musicSlice.reducer;